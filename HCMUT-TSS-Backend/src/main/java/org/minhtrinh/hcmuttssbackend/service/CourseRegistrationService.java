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
import org.minhtrinh.hcmuttssbackend.service.DatacoreClient.EligibilityResponse;
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
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final DatacoreClient datacoreClient;
    private final CourseRegistrationMapper mapper;

    public CourseRegistrationService(ClassRepository classRepository,
                                     CourseRegistrationRepository registrationRepository,
                                     UserRepository userRepository,
                                     StudentRepository studentRepository,
                                     DatacoreClient datacoreClient,
                                     CourseRegistrationMapper mapper) {
        this.classRepository = classRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.datacoreClient = datacoreClient;
        this.mapper = mapper;
    }


    @Transactional
    public EnrollmentResponse enrollInClass(EnrollmentRequest req, TssUserPrincipal principal) {
        log.info("Processing enrollment request: classId={}, courseCode={}, tutorId={}", 
                req.classId(), req.courseCode(), req.tutorId());
        
        // Authenticated user
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + principal.getEmail()));
        
        // Verify 
        Student student = studentRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new IllegalStateException("Only students can enroll in courses. No student profile found for user: " + user.getEmail()));
        
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
        // Auto-match tutor: find available classes for the course and pick the one with most available seats ( REMEMBER TO IMPLEMENT THIS!!!!!!!)
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
        
        // --- Ensure we do not register the same COURSE twice (DB constraint checks by course)
        Course course = classEntity.getCourse();
        if (course == null) {
            throw new IllegalStateException("Class " + classEntity.getClassId() + " has no associated course.");
        }

        // 1) Check by course (prevents duplicate course registration across classes)
        registrationRepository.findByStudent_StudentIdAndCourse_CourseId(student.getStudentId(), course.getCourseId())
            .ifPresent(existing -> {
                throw new IllegalStateException("Already registered for this COURSE (in class " + existing.getClassEntity().getClassId() + ")");
            });

        // 2) Check by exact class (previous logic)
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

        // Check prerequisites via Datacore
        try {
            EligibilityResponse resp = datacoreClient.checkPrerequisitesByEmail(classEntity.getCourse().getCode(), user.getEmail());
            if (!resp.eligible()) {
                throw new IllegalStateException("Student does not satisfy prerequisites: " + String.join(", ", resp.missing()));
            }
        } catch (Exception ex) {
            log.warn("Prerequisite check failed or Datacore unavailable, allowing enrollment by default", ex);
        }
        

        // Create registration (course already validated above)
        CourseRegistration registration = CourseRegistration.builder()
            .student(student)
            .classEntity(classEntity)
            .course(course)
            .registeredAt(Instant.now())
            .build();
        
        CourseRegistration saved = registrationRepository.save(registration);
        // increment enrolledCount and persist class
        try {
            Integer ec = classEntity.getEnrolledCount() == null ? 0 : classEntity.getEnrolledCount();
            classEntity.setEnrolledCount(ec + 1);
            classRepository.save(classEntity);
        } catch (Exception ex) {
            log.warn("Failed to update enrolledCount on class {}", classEntity.getClassId(), ex);
        }
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

        Student student = studentRepository.findByStudentId(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

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
            Student s = studentRepository.findByStudentId(req.studentId()).orElseThrow(() -> new IllegalArgumentException("Student not found: " + req.studentId()));
            return s.getStudentId();
        }

        String email = req.studentEmail() != null ? req.studentEmail() : principal.getEmail();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found by email: " + email));
        Student student = studentRepository.findByUser_UserId(user.getUserId()).orElseThrow(() -> new IllegalStateException("Student profile not found for user: " + email));
        return student.getStudentId();
    }

        public List<CourseRegistrationResponse> listByStudentId(String studentId) {
        return registrationRepository.findByStudent_StudentId(studentId).stream()
            .map(mapper::toResponse)
            .collect(Collectors.toList());
        }

        public List<CourseRegistrationResponse> listMine(TssUserPrincipal principal) {
        User user = userRepository.findByEmail(principal.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("User not found by email"));
        String studentId = studentRepository.findByUser_UserId(user.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("Student profile not found for current user"))
            .getStudentId();
        return listByStudentId(studentId);
        }

    @Transactional
    public void exitClass(Long registrationId, TssUserPrincipal principal) {
        CourseRegistration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found: " + registrationId));

        // Resolve current user and student profile
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + principal.getEmail()));
        Student student = studentRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new IllegalStateException("Student profile not found for user: " + user.getEmail()));

        if (!reg.getStudent().getStudentId().equals(student.getStudentId())) {
            throw new IllegalStateException("Not authorized to remove this registration");
        }

        // Decrement enrolledCount on class if present
        Class classEntity = reg.getClassEntity();
        try {
            Integer ec = classEntity.getEnrolledCount() == null ? 0 : classEntity.getEnrolledCount();
            if (ec > 0) classEntity.setEnrolledCount(ec - 1);
            classRepository.save(classEntity);
        } catch (Exception ex) {
            log.warn("Failed to decrement enrolledCount for class {}: {}", classEntity.getClassId(), ex.getMessage());
        }

        registrationRepository.delete(reg);
        log.info("Student {} exited registration {} (class {})", student.getStudentId(), registrationId, classEntity.getClassId());
    }
}
