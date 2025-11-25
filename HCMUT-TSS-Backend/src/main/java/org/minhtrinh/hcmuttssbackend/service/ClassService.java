package org.minhtrinh.hcmuttssbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.ClassResponse;
import org.minhtrinh.hcmuttssbackend.dto.CreateClassRequest;
import org.minhtrinh.hcmuttssbackend.dto.UpdateClassRequest;
import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.repository.ClassRepository;
import org.minhtrinh.hcmuttssbackend.repository.CourseRepository;
import org.minhtrinh.hcmuttssbackend.repository.UniversityStaffRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.minhtrinh.hcmuttssbackend.service.CourseCreationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

@Service
public class ClassService {

    // Thêm Logger
    private static final Logger log = LoggerFactory.getLogger(ClassService.class);

    private final ClassRepository classRepository;
    private final CourseRepository courseRepository;
    private final UniversityStaffRepository staffRepository;
    private final UserRepository userRepository;
    private final UserProfilePersistenceService userProfilePersistenceService;
    private final EntityManager entityManager;
    private final CourseCreationService courseCreationService;

    public ClassService(ClassRepository classRepository,
                        CourseRepository courseRepository,
                        UniversityStaffRepository staffRepository,
                        UserRepository userRepository,
                        UserProfilePersistenceService userProfilePersistenceService,
                        EntityManager entityManager,
                        CourseCreationService courseCreationService) {
        this.classRepository = classRepository;
        this.courseRepository = courseRepository;
        this.staffRepository = staffRepository;
        this.userRepository = userRepository;
        this.userProfilePersistenceService = userProfilePersistenceService;
        this.entityManager = entityManager;
        this.courseCreationService = courseCreationService;
    }

    // Helper: ensure subprofile exists and return User entity
    private User getUserFromPrincipal(TssUserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("User must be authenticated");
        }
        userProfilePersistenceService.ensureUserSubProfilePersisted(principal);
        return userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getEmail()));
    }

    // Helper: resolve userId if present, otherwise return null
    private Integer getUserIdFromPrincipal(TssUserPrincipal principal) {
        if (principal == null) return null;
        return userRepository.findByEmail(principal.getEmail()).map(User::getUserId).orElse(null);
    }

    @Transactional
    public ClassResponse createClass(CreateClassRequest request, TssUserPrincipal principal) {
        // Ensure the user's sub-profile is persisted and retrieve User
        var user = getUserFromPrincipal(principal);
        Integer userId = user.getUserId();

        log.info("Creating class. Code: {}, Name: {}", request.courseCode(), request.courseName());

        // Find tutor first to get department for Course creation if needed
        UniversityStaff tutor = staffRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Tutor not found for userId: " + userId));

        // --- Ensure Course exists (create-if-missing) ---
        String code = request.courseCode();
        Course course = courseRepository.findByCode(code)
            .orElseGet(() -> courseCreationService.createIfNotExists(
                code,
                request.courseName(),
                tutor.getDepartment(),
                tutor.getDepartment().getDepartmentName()
            ));

        // Create new class
        // Set the class custom name separately from the Course's canonical name.
        // If the client provided a customClassName use that, otherwise leave null
        // so the UI can fall back to the Course name when displaying.
        String providedClassName = request.customClassName();
        String classCustomName = (providedClassName == null || providedClassName.isBlank()) ? null : providedClassName;

        Class newClass = Class.builder()
            .course(course)
            .tutor(tutor)
            .semester(request.semester())
            .capacity(request.capacity())
            .createdAt(LocalDateTime.now())
            .status("ACTIVE")
            .customName(classCustomName)
            .build();

        Class savedClass = classRepository.save(newClass);

        return mapToResponse(savedClass);
    }

    public Optional<ClassResponse> getClassById(Long classId, TssUserPrincipal principal) {
        return classRepository.findByClassIdWithTutorAndCourse(classId)
            .map(this::mapToResponse);
    }

    public List<ClassResponse> getAllClasses(TssUserPrincipal principal) {
        Integer requesterUserId = getUserIdFromPrincipal(principal);
        return classRepository.findAllWithTutorAndCourse().stream()
            .filter(c -> !isCreatedByRequester(c, requesterUserId))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

        public List<ClassResponse> getClassesByCourse(String courseCode, TssUserPrincipal principal) {
        Integer requesterUserId = getUserIdFromPrincipal(principal);
        Course course = courseRepository.findByCode(courseCode)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseCode));
        return classRepository.findByCourse_CourseIdWithTutorAndCourse(course.getCourseId()).stream()
            .filter(c -> !isCreatedByRequester(c, requesterUserId))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        }

    private boolean isCreatedByRequester(Class c, Integer requesterUserId) {
        if (requesterUserId == null) return false;
        if (c.getTutor() == null) return false;
        Integer tutorUserId = c.getTutor().getUserId();
        return tutorUserId != null && tutorUserId.equals(requesterUserId);
    }

    private void validateClassOwnership(Class classEntity, Integer userId) {
        if (userId == null) {
            throw new RuntimeException("User must be authenticated");
        }
        if (classEntity.getTutor() == null || classEntity.getTutor().getUserId() == null || !classEntity.getTutor().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to modify this class");
        }
    }

        public List<ClassResponse> getClassesByTutor(TssUserPrincipal principal) {
        Integer userId = getUserIdFromPrincipal(principal);
        if (userId == null) throw new RuntimeException("User must be authenticated");
        UniversityStaff tutor = staffRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new RuntimeException("Tutor not found"));
        return classRepository.findByTutor_StaffIdWithTutorAndCourse(tutor.getStaffId()).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        }

    @Transactional
    public void deleteClass(Long classId, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal);
        Integer userId = user.getUserId();

        Class classEntity = classRepository.findByClassIdWithTutorAndCourse(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        validateClassOwnership(classEntity, userId);
        classRepository.delete(classEntity);
    }

    @Transactional
    public ClassResponse updateClass(Long classId, UpdateClassRequest req, TssUserPrincipal principal) {
        User user = getUserFromPrincipal(principal); 
        Integer userId = user.getUserId();
        log.info("Bắt đầu update classId: {} cho userId: {}", classId, userId);

        Class classEntity = classRepository.findByClassIdWithTutorAndCourse(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));
        validateClassOwnership(classEntity, userId);

        // update semester/capacity
        if (req.getSemester() != null) classEntity.setSemester(req.getSemester());
        if (req.getCapacity() != null) classEntity.setCapacity(req.getCapacity());
        
        Course courseToSet = null;

        // For new course only
        if (req.getCourseCode() != null && !req.getCourseCode().isBlank()) {
            String code = req.getCourseCode();
            String name = (req.getCourseName() == null || req.getCourseName().isBlank())
                    ? "" // add 1 default name to handle bug
                    : req.getCourseName();

            log.info("Kịch bản 1: Tìm/tạo course với code {} và tên {}", code, name);

            Optional<Course> existing = courseRepository.findByCode(code);
            
            if (existing.isPresent()) {
                // Use existing course but DO NOT modify the canonical Course.name here (master data)
                courseToSet = existing.get();
            } else {
                // Create new course in an isolated transaction; department info not available here
                courseToSet = courseCreationService.createIfNotExists(code, name, null, null);
            }
            classEntity.setCourse(courseToSet);
        
        // Just da name
        } else if (req.getCourseName() != null && !req.getCourseName().isBlank()) {
            log.info("Kịch bản 2: Chỉ đổi tên -> sử dụng customName: {}", req.getCourseName());
            classEntity.setCustomName(req.getCourseName());
        }

        Class saved = classRepository.save(classEntity);
        return mapToResponse(saved);
    }

    private ClassResponse mapToResponse(Class classEntity) {
        UniversityStaff tutor = classEntity.getTutor();
        User tutorUser = (tutor == null) ? null : tutor.getUser(); // rely on join-fetch to have user loaded
        String tutorName = tutorUser == null ? null :
            ((tutorUser.getFirstName() == null ? "" : tutorUser.getFirstName()) + " " +
                (tutorUser.getLastName() == null ? "" : tutorUser.getLastName())).trim();

        String tutorOfficialId = null;
        String tutorSpecialization = null;
        String tutorDepartment = null;
        if (tutor != null) {
            tutorOfficialId = tutor.getStaffId();
            //tutorSpecialization = tutor.getSpecialization();
            tutorDepartment = tutor.getDepartment().getDepartmentName();
        }

        // Prepare course fields for response. Prefer class.customName if present.
        Course course = classEntity.getCourse();
        String responseCourseCode = null;
        String responseCourseName = null;
        if (course != null) {
            responseCourseCode = course.getCode();
            responseCourseName = course.getName();
        } 

        String responseCustomClassName = null;
        String responseDescription = null;
        if (course != null) {
            responseCustomClassName = classEntity.getCustomName();
            responseDescription = course.getDescription();
        }
        return new ClassResponse(
                classEntity.getClassId(),
                responseCourseCode,
                responseCourseName,
                responseCustomClassName,
                responseDescription,
                classEntity.getSemester(),
                tutorName,
                tutorOfficialId,
                tutorSpecialization,
                tutorDepartment,
                classEntity.getStatus(),
                classEntity.getCapacity(),
                classEntity.getEnrolledCount()
        );
    }
}
