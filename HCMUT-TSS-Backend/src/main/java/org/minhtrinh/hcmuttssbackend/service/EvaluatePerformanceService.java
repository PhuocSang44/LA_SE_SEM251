package org.minhtrinh.hcmuttssbackend.service;

import jakarta.transaction.Transactional;
import org.minhtrinh.hcmuttssbackend.dto.EvaluatePerformanceRequest;
import org.minhtrinh.hcmuttssbackend.dto.PerformanceEvaluationResponse;
import org.minhtrinh.hcmuttssbackend.entity.ActivityLog;
import org.minhtrinh.hcmuttssbackend.entity.PerformanceEvaluation;
import org.minhtrinh.hcmuttssbackend.entity.PerformanceEvaluationMetric;
import org.minhtrinh.hcmuttssbackend.entity.PerformanceEvaluationStatus;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class EvaluatePerformanceService {

    private static final Logger log = LoggerFactory.getLogger(EvaluatePerformanceService.class);

    private final PerformanceEvaluationRepository evaluationRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final CourseRegistrationRepository courseRegistrationRepository;
    private final SessionRegistrationRepository sessionRegistrationRepository;
    private final UserRepository userRepository;
    private final UniversityStaffRepository universityStaffRepository;
    private final NotificationService notificationService;
    private final ActivityLogRepository activityLogRepository;

	public EvaluatePerformanceService(PerformanceEvaluationRepository evaluationRepository,
				      ClassRepository classRepository,
				      StudentRepository studentRepository,
				      CourseRegistrationRepository courseRegistrationRepository,
				      SessionRegistrationRepository sessionRegistrationRepository,
				      UserRepository userRepository,
				      UniversityStaffRepository universityStaffRepository,
				      NotificationService notificationService,
				      ActivityLogRepository activityLogRepository) {
	this.evaluationRepository = evaluationRepository;
	this.classRepository = classRepository;
	this.studentRepository = studentRepository;
	this.courseRegistrationRepository = courseRegistrationRepository;
	this.sessionRegistrationRepository = sessionRegistrationRepository;
	this.userRepository = userRepository;
	this.universityStaffRepository = universityStaffRepository;
	this.notificationService = notificationService;
	this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public PerformanceEvaluationResponse submitEvaluation(String tutorEmail, EvaluatePerformanceRequest request) {
	validateStarRating(request);
	User tutorUser = userRepository.findByEmail(tutorEmail)
		.orElseThrow(() -> new IllegalArgumentException("User not found: " + tutorEmail));
	if (tutorUser.getUserType() == UserType.STUDENT) {
	    throw new AccessDeniedException("Students cannot submit performance evaluations");
	}

	org.minhtrinh.hcmuttssbackend.entity.Class classEntity = classRepository.findById(request.getClassId())
		.orElseThrow(() -> new IllegalArgumentException("Class not found: " + request.getClassId()));

	if (tutorUser.getUserType() != UserType.ADMINISTRATOR) {
	    UniversityStaff tutorProfile = universityStaffRepository.findByUser_UserId(tutorUser.getUserId())
		    .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found"));
	    if (!Objects.equals(classEntity.getTutor().getUserId(), tutorProfile.getUserId())) {
		throw new AccessDeniedException("Tutor is not assigned to this class");
	    }
	}

	Student student = studentRepository.findByStudentId(request.getStudentId())
		.orElseThrow(() -> new IllegalArgumentException("Student not found: " + request.getStudentId()));

	if (!courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(
		student.getStudentId(), classEntity.getClassId())) {
	    throw new IllegalArgumentException("Student is not enrolled in this class");
	}

	long completedSessions = sessionRegistrationRepository
		.countByStudent_UserIdAndSession_Clazz_ClassIdAndSession_Status(student.getUserId(),
			classEntity.getClassId(), "COMPLETED");
	if (completedSessions == 0) {
	    throw new IllegalArgumentException("Student must complete at least one session before evaluation");
	}

	if (StringUtils.hasText(request.getClientRequestId())) {
	    return evaluationRepository.findByClientRequestId(request.getClientRequestId())
		    .map(existing -> {
			log.info("Idempotent evaluation submission for clientRequestId={}", request.getClientRequestId());
			return mapToResponse(existing);
		    })
		    .orElseGet(() -> persistEvaluation(tutorUser, student, classEntity, request));
	}

	return persistEvaluation(tutorUser, student, classEntity, request);
    }

    public List<PerformanceEvaluationResponse> getEvaluationsForClass(String tutorEmail, Long classId) {
	User tutor = userRepository.findByEmail(tutorEmail)
		.orElseThrow(() -> new IllegalArgumentException("User not found: " + tutorEmail));
	org.minhtrinh.hcmuttssbackend.entity.Class classEntity = classRepository.findById(classId)
		.orElseThrow(() -> new IllegalArgumentException("Class not found: " + classId));
	if (!Objects.equals(classEntity.getTutor().getUserId(), tutor.getUserId())
		&& tutor.getUserType() != UserType.ADMINISTRATOR) {
	    throw new AccessDeniedException("Forbidden: class does not belong to tutor");
	}
	return evaluationRepository.findByClassEntity_ClassId(classId).stream()
		.map(this::mapToResponse)
		.toList();
    }

    public List<PerformanceEvaluationResponse> getEvaluationsForStudent(String userEmail) {
	Student student = studentRepository.findByUser_UserId(
			userRepository.findByEmail(userEmail)
				.orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail))
				.getUserId())
		.orElseThrow(() -> new IllegalArgumentException("Student profile not found"));
	return evaluationRepository.findByStudent_UserId(student.getUserId()).stream()
		.map(this::mapToResponse)
		.toList();
    }

    @Transactional
    protected PerformanceEvaluationResponse persistEvaluation(User actor,
			      Student student,
			      org.minhtrinh.hcmuttssbackend.entity.Class classEntity,
			      EvaluatePerformanceRequest request) {
	evaluationRepository.findByClassEntity_ClassIdAndStudent_StudentId(
		classEntity.getClassId(), student.getStudentId()).ifPresent(existing -> {
	    throw new IllegalArgumentException("Performance evaluation already exists for this student in this class");
	});

	PerformanceEvaluation evaluation = PerformanceEvaluation.builder()
		.clientRequestId(request.getClientRequestId())
		.student(student)
		.classEntity(classEntity)
		.course(classEntity.getCourse())
		.tutor(classEntity.getTutor())
		.overallComment(request.getOverallComment())
		.status(PerformanceEvaluationStatus.SUBMITTED)
		.starRating(request.getStarRating())
		.numericScore(request.getNumericScore())
		.submittedAt(LocalDateTime.now())
		.build();

	request.getMetrics().forEach(metric -> evaluation.getMetrics().add(
		PerformanceEvaluationMetric.builder()
			.evaluation(evaluation)
			.question(metric.getQuestion())
			.score(metric.getScore())
			.maxScore(metric.getMaxScore())
			.metricComment(metric.getComment())
			.build()
	));

	evaluation.setOverallScore(calculateOverallScore(evaluation));
	PerformanceEvaluation saved = evaluationRepository.save(evaluation);
	notificationService.notifyPerformanceEvaluationCreated(saved);
	activityLogRepository.save(ActivityLog.builder()
		.userId(actor.getUserId())
		.action("SUBMIT_EVALUATION")
		.entityType("PERFORMANCE_EVALUATION")
		.entityId(saved.getEvaluationId())
		.description("Tutor submitted evaluation for student " + student.getStudentId())
		.build());
	return mapToResponse(saved);
    }

    private double calculateOverallScore(PerformanceEvaluation evaluation) {
	if (evaluation.getMetrics().isEmpty()) {
	    return 0;
	}
	double normalizedSum = evaluation.getMetrics().stream()
		.mapToDouble(metric -> {
		    Double maxScore = metric.getMaxScore();
		    if (maxScore == null || maxScore <= 0) {
			return 0;
		    }
		    double normalized = metric.getScore() / maxScore;
		    return Math.min(Math.max(normalized, 0d), 1d);
		})
		.sum();
	return (normalizedSum / evaluation.getMetrics().size()) * 100d;
    }

    private PerformanceEvaluationResponse mapToResponse(PerformanceEvaluation evaluation) {
	User studentUser = userRepository.findById(evaluation.getStudent().getUserId()).orElse(null);
	String studentName = studentUser != null
		? studentUser.getFirstName() + " " + studentUser.getLastName()
		: "Unknown";
	User tutorUser = userRepository.findById(evaluation.getTutor().getUserId()).orElse(null);
	String tutorName = tutorUser != null
		? tutorUser.getFirstName() + " " + tutorUser.getLastName()
		: "Unknown";

	List<PerformanceEvaluationResponse.MetricResponse> metricResponses = evaluation.getMetrics().stream()
		.map(metric -> PerformanceEvaluationResponse.MetricResponse.builder()
			.metricId(metric.getMetricId())
			.question(metric.getQuestion())
			.score(metric.getScore())
			.maxScore(metric.getMaxScore())
			.comment(metric.getMetricComment())
			.build())
		.toList();

	return PerformanceEvaluationResponse.builder()
		.evaluationId(evaluation.getEvaluationId())
		.clientRequestId(evaluation.getClientRequestId())
		.studentId(evaluation.getStudent().getStudentId())
		.studentName(studentName)
		.classId(evaluation.getClassEntity().getClassId())
		.className(StringUtils.hasText(evaluation.getClassEntity().getCustomName())
			? evaluation.getClassEntity().getCustomName()
			: evaluation.getClassEntity().getCourse().getName())
		.courseId(evaluation.getCourse().getCourseId())
		.courseCode(evaluation.getCourse().getCode())
		.courseName(evaluation.getCourse().getName())
		.tutorName(tutorName)
		.overallScore(evaluation.getOverallScore())
		.overallComment(evaluation.getOverallComment())
		.starRating(evaluation.getStarRating())
		.numericScore(evaluation.getNumericScore())
		.status(evaluation.getStatus())
		.submittedAt(evaluation.getSubmittedAt())
		.updatedAt(evaluation.getUpdatedAt())
		.metrics(metricResponses)
		.build();
    }

    private void validateStarRating(EvaluatePerformanceRequest request) {
	if (request.getStarRating() == null) {
	    throw new IllegalArgumentException("Please select rating stars");
	}
    }
}
