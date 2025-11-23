package org.minhtrinh.hcmuttssbackend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.minhtrinh.hcmuttssbackend.config.FeedbackProperties;
import org.minhtrinh.hcmuttssbackend.dto.EnrolledCourseResponse;
import org.minhtrinh.hcmuttssbackend.dto.FeedbackResponse;
import org.minhtrinh.hcmuttssbackend.dto.SubmitFeedbackRequest;
import org.minhtrinh.hcmuttssbackend.entity.ActivityLog;
import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.entity.CourseRegistration;
import org.minhtrinh.hcmuttssbackend.entity.Department;
import org.minhtrinh.hcmuttssbackend.entity.Feedback;
import org.minhtrinh.hcmuttssbackend.entity.FeedbackRating;
import org.minhtrinh.hcmuttssbackend.entity.FeedbackStatus;
import org.minhtrinh.hcmuttssbackend.entity.Student;
import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.entity.UserType;
import org.minhtrinh.hcmuttssbackend.repository.ActivityLogRepository;
import org.minhtrinh.hcmuttssbackend.repository.ClassRepository;
import org.minhtrinh.hcmuttssbackend.repository.CourseRegistrationRepository;
import org.minhtrinh.hcmuttssbackend.repository.CourseRepository;
import org.minhtrinh.hcmuttssbackend.repository.FeedbackRepository;
import org.minhtrinh.hcmuttssbackend.repository.SessionRegistrationRepository;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private ClassRepository classRepository;
    @Mock
    private CourseRegistrationRepository courseRegistrationRepository;
    @Mock
    private SessionRegistrationRepository sessionRegistrationRepository;
    @Mock
    private ActivityLogRepository activityLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MediaValidationService mediaValidationService;
    @Mock
    private NotificationService notificationService;

    private FeedbackProperties feedbackProperties;
    private FeedbackService feedbackService;

    private User studentUser;
    private Student student;
    private Course course;
    private Class classEntity;
    private UniversityStaff tutor;
    private User tutorUser;

    @BeforeEach
    void setUp() {
        feedbackProperties = new FeedbackProperties();
        feedbackProperties.setRequireCompletedSession(true);
        feedbackProperties.setCompletedSessionStatus("COMPLETED");

        feedbackService = new FeedbackService(
            feedbackRepository,
            studentRepository,
            courseRepository,
            classRepository,
            courseRegistrationRepository,
            sessionRegistrationRepository,
            activityLogRepository,
            userRepository,
            mediaValidationService,
            notificationService,
            feedbackProperties
        );

        Department department = Department.builder()
            .departmentId(1)
            .departmentName("Computer Science")
            .build();

        studentUser = User.builder()
            .userId(100)
            .email("student@example.com")
            .firstName("Stu")
            .lastName("Dent")
            .userType(UserType.STUDENT)
            .build();

        tutorUser = User.builder()
            .userId(200)
            .email("tutor@example.com")
            .firstName("Tutor")
            .lastName("Smith")
            .userType(UserType.TUTOR)
            .build();

        student = Student.builder()
            .userId(studentUser.getUserId())
            .user(studentUser)
            .studentId("STU-001")
            .department(department)
            .build();

        tutor = UniversityStaff.builder()
            .userId(tutorUser.getUserId())
            .user(tutorUser)
            .department(department)
            .staffId("TUT-01")
            .build();

        course = Course.builder()
            .courseId(50L)
            .code("CS101")
            .name("Intro to CS")
            .department(department)
            .departmentName("CS")
            .build();

        classEntity = Class.builder()
            .classId(75L)
            .course(course)
            .customName("CS101 - A")
            .semester("Fall 2024")
            .tutor(tutor)
            .status("ACTIVE")
            .createdAt(LocalDateTime.now())
            .build();
    }

    @Test
    void submitFeedback_successfulFlow_persistsAndNotifies() {
        SubmitFeedbackRequest request = buildRequest();

        when(userRepository.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));
        when(studentRepository.findByUser_UserId(studentUser.getUserId())).thenReturn(Optional.of(student));
        when(courseRepository.findById(course.getCourseId())).thenReturn(Optional.of(course));
        when(classRepository.findById(classEntity.getClassId())).thenReturn(Optional.of(classEntity));
        when(courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(student.getStudentId(), classEntity.getClassId()))
            .thenReturn(true);
        when(feedbackRepository.existsByStudent_UserIdAndClassEntity_ClassId(student.getUserId(), classEntity.getClassId()))
            .thenReturn(false);
        when(sessionRegistrationRepository.countByStudent_UserIdAndSession_Clazz_ClassIdAndSession_Status(
            student.getUserId(), classEntity.getClassId(), feedbackProperties.getCompletedSessionStatus()))
            .thenReturn(2L);
        when(feedbackRepository.findByClientRequestId(request.getClientRequestId())).thenReturn(Optional.empty());
        when(userRepository.findById(studentUser.getUserId())).thenReturn(Optional.of(studentUser));
        when(userRepository.findById(tutorUser.getUserId())).thenReturn(Optional.of(tutorUser));
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(invocation -> {
            Feedback feedback = invocation.getArgument(0);
            feedback.setFeedbackId(900L);
            feedback.getRatings().forEach(rating -> rating.setRatingId(321L));
            return feedback;
        });
        when(activityLogRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FeedbackResponse response = feedbackService.submitFeedback(studentUser.getEmail(), request);

        assertThat(response.getFeedbackId()).isEqualTo(900L);
        assertThat(response.getRatings()).hasSize(1);
        assertThat(response.getStatus()).isEqualTo(FeedbackStatus.PENDING);
        verify(mediaValidationService).validateImageUrl(request.getImageUrl());
        verify(feedbackRepository).save(any(Feedback.class));
        verify(activityLogRepository).save(any(ActivityLog.class));
        verify(notificationService).notifyFeedbackSubmitted(any(Feedback.class));
    }

    @Test
    void submitFeedback_idempotentRequest_returnsExisting() {
        SubmitFeedbackRequest request = buildRequest();
        Feedback existing = Feedback.builder()
            .feedbackId(42L)
            .student(student)
            .course(course)
            .classEntity(classEntity)
            .status(FeedbackStatus.PENDING)
            .ratings(List.of(FeedbackRating.builder()
                .ratingId(10L)
                .question("Q1")
                .ratingValue(4)
                .build()))
            .build();

        when(userRepository.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));
        when(studentRepository.findByUser_UserId(studentUser.getUserId())).thenReturn(Optional.of(student));
        when(courseRepository.findById(course.getCourseId())).thenReturn(Optional.of(course));
        when(classRepository.findById(classEntity.getClassId())).thenReturn(Optional.of(classEntity));
        when(courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(student.getStudentId(), classEntity.getClassId()))
            .thenReturn(true);
        when(feedbackRepository.existsByStudent_UserIdAndClassEntity_ClassId(student.getUserId(), classEntity.getClassId()))
            .thenReturn(false);
        when(sessionRegistrationRepository.countByStudent_UserIdAndSession_Clazz_ClassIdAndSession_Status(
            student.getUserId(), classEntity.getClassId(), feedbackProperties.getCompletedSessionStatus()))
            .thenReturn(1L);
        when(feedbackRepository.findByClientRequestId(request.getClientRequestId())).thenReturn(Optional.of(existing));
        when(userRepository.findById(studentUser.getUserId())).thenReturn(Optional.of(studentUser));
        when(userRepository.findById(tutorUser.getUserId())).thenReturn(Optional.of(tutorUser));

        FeedbackResponse response = feedbackService.submitFeedback(studentUser.getEmail(), request);

        assertThat(response.getFeedbackId()).isEqualTo(42L);
        verify(feedbackRepository, never()).save(any());
        verifyNoInteractions(notificationService, activityLogRepository);
    }

    @Test
    void submitFeedback_requiresCompletedSessionEnforced() {
        SubmitFeedbackRequest request = buildRequest();

        when(userRepository.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));
        when(studentRepository.findByUser_UserId(studentUser.getUserId())).thenReturn(Optional.of(student));
        when(courseRepository.findById(course.getCourseId())).thenReturn(Optional.of(course));
        when(classRepository.findById(classEntity.getClassId())).thenReturn(Optional.of(classEntity));
        when(courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(student.getStudentId(), classEntity.getClassId()))
            .thenReturn(true);
        when(feedbackRepository.existsByStudent_UserIdAndClassEntity_ClassId(student.getUserId(), classEntity.getClassId()))
            .thenReturn(false);
        when(sessionRegistrationRepository.countByStudent_UserIdAndSession_Clazz_ClassIdAndSession_Status(
            student.getUserId(), classEntity.getClassId(), feedbackProperties.getCompletedSessionStatus()))
            .thenReturn(0L);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> feedbackService.submitFeedback(studentUser.getEmail(), request));
        assertThat(exception.getMessage()).contains("complete at least one session");
    }

    @Test
    void submitFeedback_duplicateSubmissionRejected() {
        SubmitFeedbackRequest request = buildRequest();

        when(userRepository.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));
        when(studentRepository.findByUser_UserId(studentUser.getUserId())).thenReturn(Optional.of(student));
        when(courseRepository.findById(course.getCourseId())).thenReturn(Optional.of(course));
        when(classRepository.findById(classEntity.getClassId())).thenReturn(Optional.of(classEntity));
        when(courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(student.getStudentId(), classEntity.getClassId()))
            .thenReturn(true);
        when(feedbackRepository.existsByStudent_UserIdAndClassEntity_ClassId(student.getUserId(), classEntity.getClassId()))
            .thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> feedbackService.submitFeedback(studentUser.getEmail(), request));
        assertThat(exception.getMessage()).contains("Feedback already submitted");
    }

    @Test
    void updateFeedbackStatus_studentModeratorForbidden() {
        when(userRepository.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> feedbackService.updateFeedbackStatus(studentUser.getEmail(), 1L, FeedbackStatus.APPROVED));
        assertThat(exception.getMessage()).isEqualTo("Students cannot moderate feedback");
    }

    @Test
    void updateFeedbackStatus_successfulModeration() {
        User moderator = User.builder()
            .userId(700)
            .email("mod@example.com")
            .firstName("Mod")
            .lastName("Erator")
            .userType(UserType.ADMINISTRATOR)
            .build();
        Feedback feedback = Feedback.builder()
            .feedbackId(88L)
            .student(student)
            .course(course)
            .classEntity(classEntity)
            .status(FeedbackStatus.PENDING)
            .build();

        when(userRepository.findByEmail(moderator.getEmail())).thenReturn(Optional.of(moderator));
        when(feedbackRepository.findById(feedback.getFeedbackId())).thenReturn(Optional.of(feedback));
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById(studentUser.getUserId())).thenReturn(Optional.of(studentUser));
        when(userRepository.findById(tutorUser.getUserId())).thenReturn(Optional.of(tutorUser));

        FeedbackResponse response = feedbackService.updateFeedbackStatus(moderator.getEmail(), feedback.getFeedbackId(), FeedbackStatus.APPROVED);

        assertThat(response.getStatus()).isEqualTo(FeedbackStatus.APPROVED);
        verify(notificationService).notifyFeedbackModerated(any(Feedback.class));
        verify(feedbackRepository).save(feedback);
        assertThat(feedback.getModeratedByUserId()).isEqualTo(moderator.getUserId());
    }

    @Test
    void getEnrolledCourses_returnsTutorInformation() {
        CourseRegistration registration = CourseRegistration.builder()
            .registrationId(1L)
            .student(student)
            .course(course)
            .classEntity(classEntity)
            .build();

        when(userRepository.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));
        when(studentRepository.findByUser_UserId(studentUser.getUserId())).thenReturn(Optional.of(student));
        when(courseRegistrationRepository.findByStudent_StudentId(student.getStudentId()))
            .thenReturn(List.of(registration));
        when(userRepository.findById(tutorUser.getUserId())).thenReturn(Optional.of(tutorUser));

        List<EnrolledCourseResponse> responses = feedbackService.getEnrolledCourses(studentUser.getEmail());

        assertThat(responses).hasSize(1);
        EnrolledCourseResponse dto = responses.get(0);
        assertThat(dto.getTutorName()).isEqualTo("Tutor Smith");
        assertThat(dto.getCourseCode()).isEqualTo("CS101");
    }

    private SubmitFeedbackRequest buildRequest() {
        return SubmitFeedbackRequest.builder()
            .clientRequestId(UUID.randomUUID().toString())
            .courseId(course.getCourseId())
            .classId(classEntity.getClassId())
            .comment("Great class")
            .imageUrl("https://cdn.example.com/image.png")
            .ratings(List.of(SubmitFeedbackRequest.RatingQuestion.builder()
                .question("Clarity")
                .ratingValue(5)
                .build()))
            .build();
    }
}
