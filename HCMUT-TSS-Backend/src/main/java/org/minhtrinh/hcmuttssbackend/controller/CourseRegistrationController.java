//Vuong
package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.CourseRegistrationResponse;
import org.minhtrinh.hcmuttssbackend.dto.EnrollmentRequest;
import org.minhtrinh.hcmuttssbackend.dto.EnrollmentResponse;
import org.minhtrinh.hcmuttssbackend.dto.RegisterCourseRequest;
import org.minhtrinh.hcmuttssbackend.service.CourseRegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/course-registrations")
public class CourseRegistrationController {

    private final CourseRegistrationService rService;

    public CourseRegistrationController(CourseRegistrationService rService) {
        this.rService = rService;
    }

    @PostMapping("/enroll")
    public ResponseEntity<EnrollmentResponse> enrollInClass(@RequestBody EnrollmentRequest req,
                                                             @AuthenticationPrincipal TssUserPrincipal principal) {
        return ResponseEntity.ok(rService.enrollInClass(req, principal));
    }

    @PostMapping
    public ResponseEntity<CourseRegistrationResponse> register(@RequestBody RegisterCourseRequest req,
                                                               @AuthenticationPrincipal TssUserPrincipal principal) {
        return ResponseEntity.ok(rService.register(req, principal));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<List<CourseRegistrationResponse>> listByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(rService.listByStudentId(studentId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<CourseRegistrationResponse>> listMine(@AuthenticationPrincipal TssUserPrincipal principal) {
        return ResponseEntity.ok(rService.listMine(principal));
    }

    @DeleteMapping("/{registrationId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<Void> exitClass(@PathVariable Long registrationId,
                                          @AuthenticationPrincipal TssUserPrincipal principal) {
        rService.exitClass(registrationId, principal);
        return ResponseEntity.noContent().build();
    }
}
