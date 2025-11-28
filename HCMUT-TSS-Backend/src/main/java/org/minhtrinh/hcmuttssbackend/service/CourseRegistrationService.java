//vuong
package org.minhtrinh.hcmuttssbackend.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.CourseRegistrationResponse;
import org.minhtrinh.hcmuttssbackend.dto.EnrollmentRequest;
import org.minhtrinh.hcmuttssbackend.dto.EnrollmentResponse;
import org.minhtrinh.hcmuttssbackend.dto.RegisterCourseRequest;
import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.entity.CourseRegistration;
import org.minhtrinh.hcmuttssbackend.entity.Student;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.repository.*;
import org.minhtrinh.hcmuttssbackend.mapper.CourseRegistrationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseRegistrationService {

    private static final Logger log = LoggerFactory.getLogger(CourseRegistrationService.class);
    
    private final ClassRepository classRepository;
    private final CourseRegistrationRepository registrationRepository;
    private final UserProfileService userProfileService;
    private final CourseRegistrationMapper mapper;

    public CourseRegistrationService(ClassRepository classRepository,
                                     CourseRegistrationRepository registrationRepository,
                                     UserProfileService userProfileService,
                                     CourseRegistrationMapper mapper) {
        this.classRepository = classRepository;
        this.registrationRepository = registrationRepository;
        this.userProfileService = userProfileService;
        this.mapper = mapper;
    }


    @Transactional
    public EnrollmentResponse enrollInClass(EnrollmentRequest req, TssUserPrincipal principal) {
        log.info("Processing enrollment request: classId={}, courseCode={}, tutorId={}", 
                req.classId(), req.courseCode(), req.tutorId());
        
        // Authenticated user + student profile (delegated to UserProfileService)
        User user = userProfileService.getUserByEmail(principal.getEmail());
        Student student = userProfileService.getStudentByUserId(user.getUserId());
        
        // Find the class
        Class classEntity = null;
        if (req.classId() != null) {
            classEntity = classRepository.findById(req.classId())
                    .orElseThrow(() -> new IllegalArgumentException("Class not found: " + req.classId()));
        } else if (req.courseCode() != null && req.tutorId() != null) {
            // Find class by course code and tutor
            classEntity = classRepository.findByCourse_CodeAndTutor_StaffId(req.courseCode(), req.tutorId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "No class found for course " + req.courseCode() + " with tutor ID " + req.tutorId()));
        } else if (req.courseCode() != null) {
        // Auto-match tutor
            var candidates = classRepository.findByCourse_Code(req.courseCode()).stream()
                    .filter(c -> c.getStatus() != null && c.getStatus().equalsIgnoreCase("ACTIVE"))
                    .toList();

            Class best = null;
            int bestAvail = -1;
            for (Class c : candidates) {
                Integer cap = c.getCapacity();
                long enrolled = registrationRepository.countByClassEntity_ClassId(c.getClassId());
                int avail = cap == null ? Integer.MAX_VALUE : (cap - (int) enrolled);
                if (avail > 0 && avail > bestAvail) {
                    best = c;
                    bestAvail = avail;
                }
            }
            if (best == null) {
                throw new IllegalArgumentException("No available class found for course " + req.courseCode());
            }
            classEntity = best;
        } else {
            throw new IllegalArgumentException("Either classId or courseCode (for auto-match) must be provided");
        }
        
        // Check if class is active
        if (!"ACTIVE".equalsIgnoreCase(classEntity.getStatus())) {
            throw new IllegalStateException("Cannot enroll in inactive class");
        }

        // Prevent tutor from enrolling in their own class
        if (classEntity.getTutor() != null && user.getUserId() != null && classEntity.getTutor().getUserId() != null
                && classEntity.getTutor().getUserId().equals(user.getUserId())) {
            throw new IllegalStateException("Cannot enroll in a class you are teaching");
        }
        
        Course course = classEntity.getCourse();
        if (course == null) {
            throw new IllegalStateException("Class " + classEntity.getClassId() + " has no associated course.");
        }
        registrationRepository.findByStudent_StudentIdAndCourse_CourseId(student.getStudentId(), course.getCourseId())
            .ifPresent(existing -> {
                throw new IllegalStateException("Already registered for this COURSE (in class " + existing.getClassEntity().getClassId() + ")");
            });
        registrationRepository.findByStudent_StudentIdAndClassEntity_ClassId(student.getStudentId(), classEntity.getClassId())
                .ifPresent(existing -> {
                    throw new IllegalStateException("Already registered for this specific CLASS.");
                });

        // Capacity check
        Integer capacity = classEntity.getCapacity();
        if (capacity != null) {
            long enrolled = registrationRepository.countByClassEntity_ClassId(classEntity.getClassId());
            if (enrolled >= capacity) {
                throw new IllegalStateException("Class is full");
            }
        }

        // Atomically increment enrolledCount in DB to prevent race conditions
        int updated = classRepository.incrementEnrolledIfSpace(classEntity.getClassId());
        if (updated == 0) {
            throw new IllegalStateException("Class is full");
        }

        // Create registration 
        CourseRegistration registration = CourseRegistration.builder()
            .student(student)
            .classEntity(classEntity)
            .course(course)
            .registeredAt(Instant.now())
            .build();

        CourseRegistration saved = registrationRepository.save(registration);
        log.info("Successfully enrolled student {} in class {}", student.getStudentId(), classEntity.getClassId());
        return mapper.toEnrollmentResponse(saved);
    }

    @Transactional
    public CourseRegistrationResponse register(RegisterCourseRequest req, @AuthenticationPrincipal TssUserPrincipal principal) {
        Long classId = req.classId();
        if (classId == null) {
            throw new IllegalArgumentException("ClassId is required");
        }

        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new IllegalArgumentException("Cannot found class: " + classId));

        String studentId = resolveStudentId(req, principal);
        Student student = userProfileService.getStudentByStudentId(studentId);

        // Check dup
        Course course = classEntity.getCourse();
        if (course == null) {
            throw new IllegalStateException("Class " + classId + " has no associated course.");
        }

        registrationRepository.findByStudent_StudentIdAndCourse_CourseId(student.getStudentId(), course.getCourseId())
            .ifPresent(existing -> { throw new IllegalStateException("Already registered for this COURSE (in class " + existing.getClassEntity().getClassId() + ")"); });

        // Chheck exact class
        registrationRepository.findByStudent_StudentIdAndClassEntity_ClassId(studentId, classId)
            .ifPresent(existing -> {throw new IllegalStateException("Already registered for this specific CLASS.");});

        // Atomically increment enrolledCount to reserve a seat (or allow unlimited)
        int updated = classRepository.incrementEnrolledIfSpace(classEntity.getClassId());
        if (updated == 0) {
            throw new IllegalStateException("Class is full");
        }

        CourseRegistration cr = CourseRegistration.builder()
            .student(student)
            .classEntity(classEntity)
            .course(classEntity.getCourse())
            .registeredAt(Instant.now())
            .build();
        CourseRegistration saved = registrationRepository.save(cr);
        return mapper.toResponse(saved);
    }

    private String resolveStudentId(RegisterCourseRequest req, TssUserPrincipal principal) {
        if (req.studentId() != null) {
            // 2nd layer check if student exists
            Student s = userProfileService.getStudentByStudentId(req.studentId());
            return s.getStudentId();
        }

        String email = req.studentEmail() != null ? req.studentEmail() : principal.getEmail();
        User user = userProfileService.getUserByEmail(email);
        Student student = userProfileService.getStudentByUserId(user.getUserId());
        return student.getStudentId();
    }

        public List<CourseRegistrationResponse> listByStudentId(String studentId) {
        return registrationRepository.findByStudent_StudentId(studentId).stream()
            .map(mapper::toResponse)
            .collect(Collectors.toList());
        }

        public List<CourseRegistrationResponse> listMine(TssUserPrincipal principal) {
        User user = userProfileService.getUserByEmail(principal.getEmail());
        String studentId = userProfileService.getStudentByUserId(user.getUserId()).getStudentId();
        return listByStudentId(studentId);
        }

    @Transactional
    public void exitClass(Long registrationId, TssUserPrincipal principal) {
        CourseRegistration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found: " + registrationId));

        // Resolve current user and student profile (delegated)
        User user = userProfileService.getUserByEmail(principal.getEmail());
        Student student = userProfileService.getStudentByUserId(user.getUserId());

        if (!reg.getStudent().getStudentId().equals(student.getStudentId())) {
            throw new IllegalStateException("Not authorized to remove this registration");
        }

        // Decrement enrolledCount atomically; if this fails, let the transaction roll back
        Class classEntity = reg.getClassEntity();
        int dec = classRepository.decrementEnrolledIfPositive(classEntity.getClassId());
        if (dec == 0) {
            throw new IllegalStateException("Failed to decrement enrolled count for class " + classEntity.getClassId());
        }

        registrationRepository.delete(reg);
        log.info("Student {} exited registration {} (class {})", student.getStudentId(), registrationId, classEntity.getClassId());
    }
}
