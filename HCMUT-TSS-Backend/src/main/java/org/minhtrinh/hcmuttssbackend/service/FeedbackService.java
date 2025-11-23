package org.minhtrinh.hcmuttssbackend.service;

import jakarta.transaction.Transactional;
import org.minhtrinh.hcmuttssbackend.config.FeedbackProperties;
import org.minhtrinh.hcmuttssbackend.dto.EnrolledCourseResponse;
import org.minhtrinh.hcmuttssbackend.dto.FeedbackResponse;
import org.minhtrinh.hcmuttssbackend.dto.SubmitFeedbackRequest;
import org.minhtrinh.hcmuttssbackend.entity.*;
import org.minhtrinh.hcmuttssbackend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private static final Logger log = LoggerFactory.getLogger(FeedbackService.class);

        private final FeedbackRepository feedbackRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final ClassRepository classRepository;
    private final CourseRegistrationRepository courseRegistrationRepository;
    private final SessionRegistrationRepository sessionRegistrationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final MediaValidationService mediaValidationService;
    private final NotificationService notificationService;
    private final FeedbackProperties feedbackProperties;

        public FeedbackService(FeedbackRepository feedbackRepository,
                           StudentRepository studentRepository,
                           CourseRepository courseRepository,
                           ClassRepository classRepository,
                           CourseRegistrationRepository courseRegistrationRepository,
                           SessionRegistrationRepository sessionRegistrationRepository,
                           ActivityLogRepository activityLogRepository,
                           UserRepository userRepository,
                           MediaValidationService mediaValidationService,
                           NotificationService notificationService,
                           FeedbackProperties feedbackProperties) {
        this.feedbackRepository = feedbackRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.classRepository = classRepository;
        this.courseRegistrationRepository = courseRegistrationRepository;
        this.sessionRegistrationRepository = sessionRegistrationRepository;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.mediaValidationService = mediaValidationService;
        this.notificationService = notificationService;
        this.feedbackProperties = feedbackProperties;
    }

    public List<EnrolledCourseResponse> getEnrolledCourses(String userEmail) {
        Student student = resolveStudent(userEmail);
        List<CourseRegistration> registrations = courseRegistrationRepository
                .findByStudent_StudentId(student.getStudentId());

        return registrations.stream()
                .map(reg -> {
                    org.minhtrinh.hcmuttssbackend.entity.Class classEntity = reg.getClassEntity();
                    Course course = reg.getCourse();
                    UniversityStaff tutor = classEntity.getTutor();
                    User tutorUser = userRepository.findById(tutor.getUserId()).orElse(null);
                    String tutorName = tutorUser != null
                            ? tutorUser.getFirstName() + " " + tutorUser.getLastName()
                            : "Unknown";
                    return EnrolledCourseResponse.builder()
                            .courseId(course.getCourseId())
                            .courseCode(course.getCode())
                            .courseName(course.getName())
                            .classId(classEntity.getClassId())
                            .className(StringUtils.hasText(classEntity.getCustomName())
                                    ? classEntity.getCustomName()
                                    : course.getName())
                            .semester(classEntity.getSemester())
                            .tutorName(tutorName)
                            .status(classEntity.getStatus())
                            .build();
                })
                .toList();
    }

    @Transactional
    public FeedbackResponse submitFeedback(String userEmail, SubmitFeedbackRequest request) {
        mediaValidationService.validateImageUrl(request.getImageUrl());
        Student student = resolveStudent(userEmail);
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + request.getCourseId()));
        org.minhtrinh.hcmuttssbackend.entity.Class classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + request.getClassId()));

        if (!Objects.equals(classEntity.getCourse().getCourseId(), course.getCourseId())) {
            throw new IllegalArgumentException("Class does not belong to the given course");
        }

        if (!courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(
                student.getStudentId(), classEntity.getClassId())) {
            throw new IllegalArgumentException("Student is not enrolled in this class");
        }

        if (feedbackRepository.existsByStudent_UserIdAndClassEntity_ClassId(student.getUserId(), classEntity.getClassId())) {
            throw new IllegalArgumentException("Feedback already submitted for this class");
        }

        if (feedbackProperties.isRequireCompletedSession()) {
            long completed = sessionRegistrationRepository
                    .countByStudent_UserIdAndSession_Clazz_ClassIdAndSession_Status(
                            student.getUserId(),
                            classEntity.getClassId(),
                            feedbackProperties.getCompletedSessionStatus());
            if (completed == 0) {
                throw new IllegalArgumentException("Student must complete at least one session before submitting feedback");
            }
        }

        return feedbackRepository.findByClientRequestId(request.getClientRequestId())
                .map(existing -> {
                    log.info("Idempotent feedback submission for clientRequestId={}", request.getClientRequestId());
                    return mapToResponse(existing);
                })
                .orElseGet(() -> createFeedback(student, classEntity, course, request));
    }

    public List<FeedbackResponse> getStudentFeedback(String userEmail) {
        Student student = resolveStudent(userEmail);
        return feedbackRepository.findByStudent_StudentIdOrderByCreatedAtDesc(student.getStudentId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<FeedbackResponse> getCourseFeedback(Long courseId) {
        return feedbackRepository.findByCourse_CourseId(courseId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<FeedbackResponse> getClassFeedback(Long classId) {
        return feedbackRepository.findByClassEntity_ClassId(classId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<FeedbackResponse> getPendingFeedback() {
        return feedbackRepository.findByStatus(FeedbackStatus.PENDING).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public FeedbackResponse updateFeedbackStatus(String moderatorEmail, Long feedbackId, FeedbackStatus newStatus) {
        User moderator = userRepository.findByEmail(moderatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + moderatorEmail));
        // if (moderator.getUserType() == UserType.STUDENT) {
        //     throw new IllegalArgumentException("Students cannot moderate feedback");
        // }

        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found: " + feedbackId));
        feedback.setStatus(newStatus);
        feedback.setModeratedByUserId(moderator.getUserId());
        feedback.setModeratedAt(LocalDateTime.now());
        Feedback updated = feedbackRepository.save(feedback);
        notificationService.notifyFeedbackModerated(updated);
        return mapToResponse(updated);
    }

        private FeedbackResponse createFeedback(Student student,
                                                                                        org.minhtrinh.hcmuttssbackend.entity.Class classEntity,
                                            Course course,
                                            SubmitFeedbackRequest request) {
        Feedback feedback = Feedback.builder()
                .clientRequestId(request.getClientRequestId())
                .student(student)
                .course(course)
                .classEntity(classEntity)
                .comment(request.getComment())
                .imageUrl(request.getImageUrl())
                .status(FeedbackStatus.PENDING)
                .build();

        request.getRatings().forEach(rating -> feedback.getRatings().add(
                FeedbackRating.builder()
                        .feedback(feedback)
                        .question(rating.getQuestion())
                        .ratingValue(rating.getRatingValue())
                        .build()
        ));

        Feedback saved = feedbackRepository.save(feedback);
        activityLogRepository.save(ActivityLog.builder()
                .userId(student.getUserId())
                .action("SUBMIT_FEEDBACK")
                .entityType("FEEDBACK")
                .entityId(saved.getFeedbackId())
                .description("Student submitted feedback for class " + classEntity.getClassId())
                .build());
        notificationService.notifyFeedbackSubmitted(saved);
        return mapToResponse(saved);
    }

    private Student resolveStudent(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        if (user.getUserType() != UserType.STUDENT) {
            throw new IllegalArgumentException("Only students can perform this action");
        }
        return studentRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for user: " + userEmail));
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        User studentUser = userRepository.findById(feedback.getStudent().getUserId()).orElse(null);
        String studentName = studentUser != null
                ? studentUser.getFirstName() + " " + studentUser.getLastName()
                : "Unknown";
        User tutorUser = userRepository.findById(feedback.getClassEntity().getTutor().getUserId()).orElse(null);
        String tutorName = tutorUser != null
                ? tutorUser.getFirstName() + " " + tutorUser.getLastName()
                : "Unknown";

        List<FeedbackResponse.RatingResponse> ratings = feedback.getRatings().stream()
                .map(r -> FeedbackResponse.RatingResponse.builder()
                        .ratingId(r.getRatingId())
                        .question(r.getQuestion())
                        .ratingValue(r.getRatingValue())
                        .build())
                .collect(Collectors.toList());

        return FeedbackResponse.builder()
                .feedbackId(feedback.getFeedbackId())
                .clientRequestId(feedback.getClientRequestId())
                .studentId(feedback.getStudent().getStudentId())
                .studentName(studentName)
                .courseId(feedback.getCourse().getCourseId())
                .courseCode(feedback.getCourse().getCode())
                .courseName(feedback.getCourse().getName())
                .classId(feedback.getClassEntity().getClassId())
                .className(StringUtils.hasText(feedback.getClassEntity().getCustomName())
                        ? feedback.getClassEntity().getCustomName()
                        : feedback.getClassEntity().getCourse().getName())
                .tutorName(tutorName)
                .comment(feedback.getComment())
                .imageUrl(feedback.getImageUrl())
                .status(feedback.getStatus())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .moderatedAt(feedback.getModeratedAt())
                .ratings(ratings)
                .build();
    }
}

