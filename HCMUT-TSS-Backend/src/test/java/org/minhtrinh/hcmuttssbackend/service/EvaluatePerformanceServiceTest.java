package org.minhtrinh.hcmuttssbackend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.minhtrinh.hcmuttssbackend.dto.EvaluatePerformanceRequest;
import org.minhtrinh.hcmuttssbackend.entity.ActivityLog;
import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.entity.Department;
import org.minhtrinh.hcmuttssbackend.entity.PerformanceEvaluation;
import org.minhtrinh.hcmuttssbackend.entity.Student;
import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.entity.UserType;
import org.minhtrinh.hcmuttssbackend.repository.ActivityLogRepository;
import org.minhtrinh.hcmuttssbackend.repository.ClassRepository;
import org.minhtrinh.hcmuttssbackend.repository.CourseRegistrationRepository;
import org.minhtrinh.hcmuttssbackend.repository.PerformanceEvaluationRepository;
import org.minhtrinh.hcmuttssbackend.repository.SessionRegistrationRepository;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.repository.UniversityStaffRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EvaluatePerformanceServiceTest {

    @Mock
    private PerformanceEvaluationRepository evaluationRepository;
    @Mock
    private ClassRepository classRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private CourseRegistrationRepository courseRegistrationRepository;
    @Mock
    private SessionRegistrationRepository sessionRegistrationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UniversityStaffRepository universityStaffRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private ActivityLogRepository activityLogRepository;

    private EvaluatePerformanceService service;

    private User tutorUser;
    private User studentUser;
    private Student student;
    private Class classEntity;
    private Department department;
    private Course course;
    private UniversityStaff tutorProfile;

    @BeforeEach
    void setUp() {
        service = new EvaluatePerformanceService(
            evaluationRepository,
            classRepository,
            studentRepository,
            courseRegistrationRepository,
            sessionRegistrationRepository,
            userRepository,
            universityStaffRepository,
            notificationService,
            activityLogRepository
        );

        department = Department.builder()
            .departmentId(1)
            .departmentName("Computer Science")
            .build();

        tutorUser = User.builder()
            .userId(10)
            .email("tutor@example.com")
            .firstName("Tutor")
            .lastName("One")
            .userType(UserType.TUTOR)
            .build();

        studentUser = User.builder()
            .userId(20)
            .email("student@example.com")
            .firstName("Student")
            .lastName("One")
            .userType(UserType.STUDENT)
            .build();

        tutorProfile = UniversityStaff.builder()
            .userId(tutorUser.getUserId())
            .user(tutorUser)
            .department(department)
            .staffId("STF-1")
            .build();

        student = Student.builder()
            .userId(studentUser.getUserId())
            .user(studentUser)
            .studentId("S-1")
            .department(department)
            .build();

        course = Course.builder()
            .courseId(99L)
            .code("CSE101")
            .name("Intro to CS")
            .department(department)
            .departmentName("CS")
            .build();

        classEntity = Class.builder()
            .classId(100L)
            .course(course)
            .semester("Fall 2024")
            .tutor(tutorProfile)
            .createdAt(LocalDateTime.now())
            .status("ACTIVE")
            .build();
    }

    @Test
    void submitEvaluation_successfulFlow_persistsAndNotifies() {
        EvaluatePerformanceRequest request = buildRequest();

        when(userRepository.findByEmail(tutorUser.getEmail())).thenReturn(Optional.of(tutorUser));
        when(classRepository.findById(classEntity.getClassId())).thenReturn(Optional.of(classEntity));
        when(universityStaffRepository.findByUser_UserId(tutorUser.getUserId())).thenReturn(Optional.of(tutorProfile));
        when(studentRepository.findByStudentId(student.getStudentId())).thenReturn(Optional.of(student));
        when(courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(student.getStudentId(), classEntity.getClassId()))
            .thenReturn(true);
        when(sessionRegistrationRepository.countByStudent_UserIdAndSession_Clazz_ClassIdAndSession_Status(
            studentUser.getUserId(), classEntity.getClassId(), "COMPLETED"))
            .thenReturn(2L);
        when(evaluationRepository.findByClientRequestId(request.getClientRequestId())).thenReturn(Optional.empty());
        when(evaluationRepository.findByClassEntity_ClassIdAndStudent_StudentId(classEntity.getClassId(), student.getStudentId()))
            .thenReturn(Optional.empty());
        when(userRepository.findById(studentUser.getUserId())).thenReturn(Optional.of(studentUser));
        when(userRepository.findById(tutorUser.getUserId())).thenReturn(Optional.of(tutorUser));
        when(evaluationRepository.save(any(PerformanceEvaluation.class))).thenAnswer(invocation -> {
            PerformanceEvaluation eval = invocation.getArgument(0);
            eval.setEvaluationId(555L);
            return eval;
        });
        when(activityLogRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.submitEvaluation(tutorUser.getEmail(), request);

        assertNotNull(response);
        assertEquals(555L, response.getEvaluationId());
        assertEquals(request.getStarRating(), response.getStarRating());
        assertEquals(request.getMetrics().size(), response.getMetrics().size());
        verify(notificationService).notifyPerformanceEvaluationCreated(any(PerformanceEvaluation.class));
    }

    @Test
    void submitEvaluation_missingStarRating_throwsValidationError() {
        EvaluatePerformanceRequest request = buildRequest(null);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> service.submitEvaluation(tutorUser.getEmail(), request));
        assertEquals("Please select rating stars", exception.getMessage());
    }

    @Test
    void submitEvaluation_withoutCompletedSession_rejected() {
        EvaluatePerformanceRequest request = buildRequest();

        when(userRepository.findByEmail(tutorUser.getEmail())).thenReturn(Optional.of(tutorUser));
        when(classRepository.findById(classEntity.getClassId())).thenReturn(Optional.of(classEntity));
        when(universityStaffRepository.findByUser_UserId(tutorUser.getUserId())).thenReturn(Optional.of(tutorProfile));
        when(studentRepository.findByStudentId(student.getStudentId())).thenReturn(Optional.of(student));
        when(courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(student.getStudentId(), classEntity.getClassId()))
            .thenReturn(true);
        when(sessionRegistrationRepository.countByStudent_UserIdAndSession_Clazz_ClassIdAndSession_Status(
            studentUser.getUserId(), classEntity.getClassId(), "COMPLETED"))
            .thenReturn(0L);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> service.submitEvaluation(tutorUser.getEmail(), request));
        assertEquals("Student must complete at least one session before evaluation", exception.getMessage());
    }

    @Test
    void submitEvaluation_duplicateEvaluation_rejected() {
        EvaluatePerformanceRequest request = buildRequest();

        when(userRepository.findByEmail(tutorUser.getEmail())).thenReturn(Optional.of(tutorUser));
        when(classRepository.findById(classEntity.getClassId())).thenReturn(Optional.of(classEntity));
        when(universityStaffRepository.findByUser_UserId(tutorUser.getUserId())).thenReturn(Optional.of(tutorProfile));
        when(studentRepository.findByStudentId(student.getStudentId())).thenReturn(Optional.of(student));
        when(courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(student.getStudentId(), classEntity.getClassId()))
            .thenReturn(true);
        when(sessionRegistrationRepository.countByStudent_UserIdAndSession_Clazz_ClassIdAndSession_Status(
            studentUser.getUserId(), classEntity.getClassId(), "COMPLETED"))
            .thenReturn(1L);
        when(evaluationRepository.findByClientRequestId(request.getClientRequestId())).thenReturn(Optional.empty());
        when(evaluationRepository.findByClassEntity_ClassIdAndStudent_StudentId(classEntity.getClassId(), student.getStudentId()))
            .thenReturn(Optional.of(PerformanceEvaluation.builder().build()));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> service.submitEvaluation(tutorUser.getEmail(), request));
        assertEquals("Performance evaluation already exists for this student in this class", exception.getMessage());
    }

    private EvaluatePerformanceRequest buildRequest() {
        return buildRequest(5);
    }

    private EvaluatePerformanceRequest buildRequest(Integer starRating) {
        var metric = EvaluatePerformanceRequest.MetricRequest.builder()
            .question("Understanding of materials")
            .score(90.0)
            .maxScore(100.0)
            .comment("Great work")
            .build();

        return EvaluatePerformanceRequest.builder()
            .clientRequestId(UUID.randomUUID().toString())
            .classId(classEntity.getClassId())
            .studentId(student.getStudentId())
            .starRating(starRating)
            .numericScore(95.0)
            .overallComment("Excellent progress")
            .metrics(List.of(metric))
            .build();
    }
}
