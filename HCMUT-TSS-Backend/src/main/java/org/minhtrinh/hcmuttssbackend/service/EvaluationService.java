package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.dto.*;
import org.minhtrinh.hcmuttssbackend.entity.*;
import org.minhtrinh.hcmuttssbackend.repository.*;
import org.minhtrinh.hcmuttssbackend.service.UserProfileService;
import org.minhtrinh.hcmuttssbackend.service.ActivityLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
        private final StudentRepository studentRepository;
        private final CourseRepository courseRepository;
        private final ClassRepository classRepository;
        private final CourseRegistrationRepository courseRegistrationRepository;
        private final UserProfileService userProfileService;
        private final ActivityLogService activityLogService;

    public EvaluationService(
            EvaluationRepository evaluationRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository,
                        ClassRepository classRepository,
                        CourseRegistrationRepository courseRegistrationRepository,
                        UserProfileService userProfileService,
                        ActivityLogService activityLogService) {
        this.evaluationRepository = evaluationRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.classRepository = classRepository;
                this.courseRegistrationRepository = courseRegistrationRepository;
                this.userProfileService = userProfileService;
                this.activityLogService = activityLogService;
    }

    /**
     * Get list of courses taught by the tutor (Step 2)
     */
    public List<TutorCourseResponse> getTutorCourses(String userEmail) {
                UniversityStaff tutor = getVerifiedTutorByEmail(userEmail);

        List<org.minhtrinh.hcmuttssbackend.entity.Class> classes = classRepository.findByTutor_StaffId(tutor.getStaffId());

        return classes.stream()
                .map(classEntity -> {
                    Course course = classEntity.getCourse();

                    // Count enrolled students (DB-side count)
                    long enrolledCount = courseRegistrationRepository
                            .countByClassEntity_ClassId(classEntity.getClassId());

                    return TutorCourseResponse.builder()
                            .courseId(course.getCourseId())
                            .courseCode(course.getCode())
                            .courseName(course.getName())
                            .classId(classEntity.getClassId())
                            .className(classEntity.getCustomName() != null ? classEntity.getCustomName() : course.getName())
                            .semester(classEntity.getSemester())
                            .status(classEntity.getStatus())
                            .enrolledCount((int) enrolledCount)
                            .capacity(classEntity.getCapacity())
                            .build();
                })
                .collect(Collectors.toList());
    }


    public List<EnrolledStudentResponse> getEnrolledStudents(Long classId, String userEmail) {
                // Validate tutor
                User user = userProfileService.getUserByEmail(userEmail);
                UniversityStaff tutor = userProfileService.getTutorByUserId(user.getUserId());

        // Validate class and ownership
        org.minhtrinh.hcmuttssbackend.entity.Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + classId));

        if (!classEntity.getTutor().getStaffId().equals(tutor.getStaffId())) {
            throw new IllegalArgumentException("Tutor does not own this class");
        }

        // Get enrolled students
        List<CourseRegistration> registrations = courseRegistrationRepository.findByClassEntity_ClassId(classId);

        return registrations.stream()
                .map(reg -> {
                    Student student = reg.getStudent();
                    User studentUser = student.getUser(); 

                    String studentName = studentUser != null
                            ? studentUser.getFirstName() + " " + studentUser.getLastName()
                            : "Unknown";

                    String email = studentUser != null ? studentUser.getEmail() : "";

                    return EnrolledStudentResponse.builder()
                            .studentId(student.getStudentId())
                            .studentName(studentName)
                            .email(email)
                            .major(student.getMajor())
                            .academicLevel(student.getAcademicLevel())
                            .registrationId(reg.getRegistrationId())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public EvaluationResponse submitEvaluation(String userEmail, SubmitEvaluationRequest request) {
                // Validate tutor
                User user = userProfileService.getUserByEmail(userEmail);
                UniversityStaff tutor = userProfileService.getTutorByUserId(user.getUserId());

        // Validate student
        Student student = studentRepository.findByStudentId(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + request.getStudentId()));

        // Validate course
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + request.getCourseId()));

        // Validate class and ownership
        org.minhtrinh.hcmuttssbackend.entity.Class classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + request.getClassId()));

        if (!classEntity.getTutor().getStaffId().equals(tutor.getStaffId())) {
            throw new IllegalArgumentException("Tutor does not own this class");
        }

        // Check if student is enrolled in this class
        boolean isEnrolled = courseRegistrationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(
                student.getStudentId(), classEntity.getClassId());

        if (!isEnrolled) {
            throw new IllegalArgumentException("Student is not enrolled in this class");
        }

        // Check if evaluation already exists for this student and class
        boolean evaluationExists = evaluationRepository.existsByStudent_StudentIdAndClassEntity_ClassId(
                student.getStudentId(), classEntity.getClassId());

        if (evaluationExists) {
            throw new IllegalArgumentException("Evaluation already submitted for this student in this class");
        }

        // Validate evaluation items 
        if (request.getEvaluationItems() == null || request.getEvaluationItems().isEmpty()) {
            throw new IllegalArgumentException("Please select rating stars");
        }

        for (SubmitEvaluationRequest.EvaluationCriterion item : request.getEvaluationItems()) {
            if (item.getRatingValue() == null) {
                throw new IllegalArgumentException("Please select rating stars");
            }
            if (item.getMaxRating() == null || item.getMaxRating() <= 0) {
                throw new IllegalArgumentException("Max rating must be greater than 0");
            }
            if (item.getRatingValue() < 0 || item.getRatingValue() > item.getMaxRating()) {
                throw new IllegalArgumentException("Rating value must be between 0 and " + item.getMaxRating());
            }
        }
        Evaluation evaluation = Evaluation.builder()
                .student(student)
                .course(course)
                .classEntity(classEntity)
                .tutor(tutor)
                .comment(request.getComment())
                .evaluationItems(new java.util.ArrayList<>())
                .build();
        for (SubmitEvaluationRequest.EvaluationCriterion itemReq : request.getEvaluationItems()) {
            EvaluationItem item = EvaluationItem.builder()
                    .evaluation(evaluation)
                    .criterion(itemReq.getCriterion())
                    .ratingValue(itemReq.getRatingValue())
                    .maxRating(itemReq.getMaxRating() != null ? itemReq.getMaxRating() : 5)
                    .build();
            evaluation.getEvaluationItems().add(item);
        }
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
                ActivityLog log = ActivityLog.builder()
                .userId(user.getUserId())
                .action("SUBMIT_EVALUATION")
                .entityType("EVALUATION")
                .entityId(savedEvaluation.getEvaluationId())
                .description("Tutor submitted evaluation for student: " + student.getStudentId() +
                           " in class: " + classEntity.getClassId() +
                           " (Course: " + course.getName() + ")")
                .build();
                try {
                        activityLogService.saveLogRequiresNew(log);
                } catch (Exception ex) {
                        // It must not fail the main transaction; swallow or log elsewhere
                }
        return mapToResponse(savedEvaluation);
    }

    /**
     * Get all evaluations for a student
     */
    public List<EvaluationResponse> getStudentEvaluations(String studentId) {
        List<Evaluation> evaluations = evaluationRepository.findByStudent_StudentId(studentId);

        return evaluations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all evaluations for a course
     */
    public List<EvaluationResponse> getCourseEvaluations(Long courseId) {
        List<Evaluation> evaluations = evaluationRepository.findByCourse_CourseId(courseId);

        return evaluations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all evaluations for a class
     */
    public List<EvaluationResponse> getClassEvaluations(Long classId) {
        List<Evaluation> evaluations = evaluationRepository.findByClassEntity_ClassId(classId);

        return evaluations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all evaluations created by a tutor
     */
    public List<EvaluationResponse> getTutorEvaluations(String userEmail) {
                UniversityStaff tutor = getVerifiedTutorByEmail(userEmail);

                List<Evaluation> evaluations = evaluationRepository.findByTutor_StaffId(tutor.getStaffId());

        return evaluations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get specific evaluation for a student in a class
     */
    public EvaluationResponse getStudentEvaluationForClass(String studentId, Long classId) {
        Evaluation evaluation = evaluationRepository.findByStudent_StudentIdAndClassEntity_ClassId(studentId, classId)
                .orElseThrow(() -> new IllegalArgumentException("Evaluation not found for student: " + studentId + " in class: " + classId));

        return mapToResponse(evaluation);
    }

    /**
     * Map Evaluation entity to EvaluationResponse DTO
     */
    private EvaluationResponse mapToResponse(Evaluation evaluation) {
        User studentUser = evaluation.getStudent() != null ? evaluation.getStudent().getUser() : null;
        String studentName = studentUser != null
                ? studentUser.getFirstName() + " " + studentUser.getLastName()
                : "Unknown";

        User tutorUser = evaluation.getTutor() != null ? evaluation.getTutor().getUser() : null;
        String tutorName = tutorUser != null
                ? tutorUser.getFirstName() + " " + tutorUser.getLastName()
                : "Unknown";

        List<EvaluationResponse.EvaluationItemResponse> items = evaluation.getEvaluationItems().stream()
                .map(item -> EvaluationResponse.EvaluationItemResponse.builder()
                        .itemId(item.getItemId())
                        .criterion(item.getCriterion())
                        .ratingValue(item.getRatingValue())
                        .maxRating(item.getMaxRating())
                        .build())
                .collect(Collectors.toList());

        return EvaluationResponse.builder()
                .evaluationId(evaluation.getEvaluationId())
                .studentId(evaluation.getStudent().getStudentId())
                .studentName(studentName)
                .courseId(evaluation.getCourse().getCourseId())
                .courseCode(evaluation.getCourse().getCode())
                .courseName(evaluation.getCourse().getName())
                .classId(evaluation.getClassEntity().getClassId())
                .tutorId(evaluation.getTutor().getStaffId())
                .tutorName(tutorName)
                .comment(evaluation.getComment())
                .createdAt(evaluation.getCreatedAt())
                .updatedAt(evaluation.getUpdatedAt())
                .evaluationItems(items)
                .build();
    }

        //validate user email -> tutor profile
        private UniversityStaff getVerifiedTutorByEmail(String userEmail) {
                User user = userProfileService.getUserByEmail(userEmail);
                return userProfileService.getTutorByUserId(user.getUserId());
        }
}

