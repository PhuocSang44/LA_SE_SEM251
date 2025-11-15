package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.dto.EnrolledCourseResponse;
import org.minhtrinh.hcmuttssbackend.dto.FeedbackResponse;
import org.minhtrinh.hcmuttssbackend.dto.SubmitFeedbackRequest;
import org.minhtrinh.hcmuttssbackend.entity.*;
import org.minhtrinh.hcmuttssbackend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final ClassRepository classRepository;
    private final CourseRegistrationRepository courseRegistrationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            ClassRepository classRepository,
            CourseRegistrationRepository courseRegistrationRepository,
            ActivityLogRepository activityLogRepository,
            UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.classRepository = classRepository;
        this.courseRegistrationRepository = courseRegistrationRepository;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get list of enrolled courses for a student
     */
    public List<EnrolledCourseResponse> getEnrolledCourses(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        Student student = studentRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for user: " + userEmail));

        List<CourseRegistration> registrations = courseRegistrationRepository.findByStudent_StudentId(student.getStudentId());

        return registrations.stream()
                .map(reg -> {
                    org.minhtrinh.hcmuttssbackend.entity.Class classEntity = reg.getClassEntity();
                    Course course = classEntity.getCourse();
                    UniversityStaff tutor = classEntity.getTutor();

                    // Get tutor's user info
                    User tutorUser = userRepository.findById(tutor.getUserId())
                            .orElse(null);
                    String tutorName = tutorUser != null
                            ? tutorUser.getFirstName() + " " + tutorUser.getLastName()
                            : "Unknown";

                    return EnrolledCourseResponse.builder()
                            .courseId(course.getCourseId())
                            .courseCode(course.getCode())
                            .courseName(course.getName())
                            .classId(classEntity.getClassId())
                            .className(classEntity.getCustomName() != null ? classEntity.getCustomName() : course.getName())
                            .semester(classEntity.getSemester())
                            .tutorName(tutorName)
                            .status(classEntity.getStatus())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Submit feedback for a course/class
     */
    @Transactional
    public FeedbackResponse submitFeedback(String userEmail, SubmitFeedbackRequest request) {
        // Validate user and get student
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        Student student = studentRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for user: " + userEmail));

        // Validate course exists
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + request.getCourseId()));

        // Validate class exists
        org.minhtrinh.hcmuttssbackend.entity.Class classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + request.getClassId()));

        // Check if student is enrolled in this class
        boolean isEnrolled = courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(
                student.getStudentId(), classEntity.getClassId());

        if (!isEnrolled) {
            throw new IllegalArgumentException("Student is not enrolled in this class");
        }

        // Check if feedback already exists for this student and class
        boolean feedbackExists = feedbackRepository.existsByStudent_StudentIdAndClassEntity_ClassId(
                student.getStudentId(), classEntity.getClassId());

        if (feedbackExists) {
            throw new IllegalArgumentException("Feedback already submitted for this class");
        }

        // Validate ratings
        if (request.getRatings() == null || request.getRatings().isEmpty()) {
            throw new IllegalArgumentException("Please select rating stars");
        }

        for (SubmitFeedbackRequest.RatingQuestion rating : request.getRatings()) {
            if (rating.getRatingValue() == null || rating.getRatingValue() < 1 || rating.getRatingValue() > 5) {
                throw new IllegalArgumentException("Rating value must be between 1 and 5");
            }
        }

        // Create feedback
        Feedback feedback = Feedback.builder()
                .student(student)
                .course(course)
                .classEntity(classEntity)
                .comment(request.getComment())
                .imageUrl(request.getImageUrl())
                .status("PENDING") // Default status
                .build();

        // Add ratings
        for (SubmitFeedbackRequest.RatingQuestion ratingReq : request.getRatings()) {
            FeedbackRating rating = FeedbackRating.builder()
                    .feedback(feedback)
                    .question(ratingReq.getQuestion())
                    .ratingValue(ratingReq.getRatingValue())
                    .build();
            feedback.getRatings().add(rating);
        }

        // Save feedback
        Feedback savedFeedback = feedbackRepository.save(feedback);

        // Log activity
        ActivityLog log = ActivityLog.builder()
                .userId(user.getUserId())
                .action("SUBMIT_FEEDBACK")
                .entityType("FEEDBACK")
                .entityId(savedFeedback.getFeedbackId())
                .description("Student submitted feedback for class: " + classEntity.getClassId() +
                           " (Course: " + course.getName() + ")")
                .build();
        activityLogRepository.save(log);

        // Return response
        return mapToResponse(savedFeedback);
    }

    /**
     * Get all feedback for a student
     */
    public List<FeedbackResponse> getStudentFeedback(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        Student student = studentRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for user: " + userEmail));

        List<Feedback> feedbackList = feedbackRepository.findByStudent_StudentId(student.getStudentId());

        return feedbackList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all feedback for a course
     */
    public List<FeedbackResponse> getCourseFeedback(Long courseId) {
        List<Feedback> feedbackList = feedbackRepository.findByCourse_CourseId(courseId);

        return feedbackList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all feedback for a class
     */
    public List<FeedbackResponse> getClassFeedback(Long classId) {
        List<Feedback> feedbackList = feedbackRepository.findByClassEntity_ClassId(classId);

        return feedbackList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all pending feedback (for admin/tutor review)
     */
    public List<FeedbackResponse> getPendingFeedback() {
        List<Feedback> feedbackList = feedbackRepository.findByStatus("PENDING");

        return feedbackList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update feedback status (approve/reject)
     */
    @Transactional
    public FeedbackResponse updateFeedbackStatus(Long feedbackId, String status) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found: " + feedbackId));

        if (!status.equals("APPROVED") && !status.equals("REJECTED") && !status.equals("PENDING")) {
            throw new IllegalArgumentException("Invalid status. Must be APPROVED, REJECTED, or PENDING");
        }

        feedback.setStatus(status);
        Feedback updated = feedbackRepository.save(feedback);

        return mapToResponse(updated);
    }

    /**
     * Map Feedback entity to FeedbackResponse DTO
     */
    private FeedbackResponse mapToResponse(Feedback feedback) {
        User studentUser = userRepository.findById(feedback.getStudent().getUserId())
                .orElse(null);
        String studentName = studentUser != null
                ? studentUser.getFirstName() + " " + studentUser.getLastName()
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
                .studentId(feedback.getStudent().getStudentId())
                .studentName(studentName)
                .courseId(feedback.getCourse().getCourseId())
                .courseName(feedback.getCourse().getName())
                .classId(feedback.getClassEntity().getClassId())
                .comment(feedback.getComment())
                .imageUrl(feedback.getImageUrl())
                .status(feedback.getStatus())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .ratings(ratings)
                .build();
    }
}

