//Vuong
package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.CourseRegistrationResponse;
import org.minhtrinh.hcmuttssbackend.dto.EnrollmentRequest;
import org.minhtrinh.hcmuttssbackend.dto.EnrollmentResponse;
import org.minhtrinh.hcmuttssbackend.dto.RegisterCourseRequest;
import org.minhtrinh.hcmuttssbackend.entity.CourseRegistration;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.repository.CourseRegistrationRepository;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.minhtrinh.hcmuttssbackend.service.CourseRegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/course-registrations")
public class CourseRegistrationController {

    private final CourseRegistrationService rService;
    private final CourseRegistrationRepository rRepo;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public CourseRegistrationController(CourseRegistrationService rService,
                                        CourseRegistrationRepository rRepo,
                                        UserRepository userRepository,
                                        StudentRepository studentRepository) {
        this.rService = rService;
        this.rRepo = rRepo;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * New enrollment endpoint with tutor selection and eligibility checks
     */
    @PostMapping("/enroll")
    public ResponseEntity<EnrollmentResponse> enrollInClass(@RequestBody EnrollmentRequest req,
                                                             @AuthenticationPrincipal TssUserPrincipal principal) {
        CourseRegistration cr = rService.enrollInClass(req, principal);
        return ResponseEntity.ok(mapToEnrollmentResponse(cr));
    }

    @PostMapping
    public ResponseEntity<CourseRegistrationResponse> register(@RequestBody RegisterCourseRequest req,
                                                               @AuthenticationPrincipal TssUserPrincipal principal) {
        CourseRegistration cr = rService.register(req, principal);
        return ResponseEntity.ok(mapToResponse(cr));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<List<CourseRegistrationResponse>> listByStudent(@PathVariable Long studentId) {
        List<CourseRegistrationResponse> list = rRepo.findByStudent_StudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/me")
    public ResponseEntity<List<CourseRegistrationResponse>> listMine(@AuthenticationPrincipal TssUserPrincipal principal) {
        var user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found by email"));
        Long studentId = studentRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for current user"))
                .getStudentId();
        List<CourseRegistrationResponse> list = rRepo.findByStudent_StudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

        // --- New endpoint: student leaves a class ---
        @DeleteMapping("/{registrationId}")
        @PreAuthorize("hasAnyAuthority('STUDENT')")
        public ResponseEntity<Void> exitClass(@PathVariable Long registrationId,
                                                                                  @AuthenticationPrincipal TssUserPrincipal principal) {
                rService.exitClass(registrationId, principal);
                return ResponseEntity.noContent().build();
        }

    private CourseRegistrationResponse mapToResponse(CourseRegistration cr) {
        var clazz = cr.getClassEntity();
        var course = clazz.getCourse();
        var tutor = clazz.getTutor();
        String tutorName = userRepository.findById(tutor.getUserId())
                .map(u -> buildFullName(u))
                .orElse(null);
        return new CourseRegistrationResponse(
                cr.getRegistrationId(),
                clazz.getClassId(),
                course.getCode(),
                course.getName(),
                clazz.getSemester(),
                tutor.getOfficialId(),
                tutorName,
                cr.getStudent().getStudentId(),
                clazz.getStatus(),
                cr.getRegisteredAt()
        );
    }

    private EnrollmentResponse mapToEnrollmentResponse(CourseRegistration cr) {
        var clazz = cr.getClassEntity();
        var course = clazz.getCourse();
        var tutor = clazz.getTutor();
        String tutorName = userRepository.findById(tutor.getUserId())
                .map(u -> buildFullName(u))
                .orElse(null);
        return new EnrollmentResponse(
                cr.getRegistrationId(),
                clazz.getClassId(),
                course.getCode(),
                course.getName(),
                clazz.getSemester(),
                tutor.getOfficialId(),
                tutorName,
                clazz.getStatus(),
                cr.getRegisteredAt()
        );
    }

    private String buildFullName(User u) {
        String first = u.getFirstName() == null ? "" : u.getFirstName();
        String last = u.getLastName() == null ? "" : u.getLastName();
        return (first + " " + last).trim();
    }
}
