package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.ClassResponse;
import org.minhtrinh.hcmuttssbackend.dto.CreateClassRequest;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.minhtrinh.hcmuttssbackend.service.ClassService;
import org.minhtrinh.hcmuttssbackend.service.UserProfilePersistenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final ClassService classService;
    private final UserRepository userRepository;
    private final UserProfilePersistenceService userProfilePersistenceService;

    public ClassController(ClassService classService,
                           UserRepository userRepository,
                           UserProfilePersistenceService userProfilePersistenceService) {
        this.classService = classService;
        this.userRepository = userRepository;
        this.userProfilePersistenceService = userProfilePersistenceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<ClassResponse> createClass(
            @RequestBody CreateClassRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        // Ensure the user's sub-profile (Student or UniversityStaff) exists in DB
        userProfilePersistenceService.ensureUserSubProfilePersisted(principal);

        User user = userRepository.findByEmail(principal.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        ClassResponse response = classService.createClass(request, user.getUserId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<Void> deleteClass(
            @PathVariable Long id,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        userProfilePersistenceService.ensureUserSubProfilePersisted(principal);
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        classService.deleteClass(id, user.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<ClassResponse> updateClass(
            @PathVariable Long id,
            @RequestBody org.minhtrinh.hcmuttssbackend.dto.UpdateClassRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        userProfilePersistenceService.ensureUserSubProfilePersisted(principal);
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        ClassResponse resp = classService.updateClass(id, request, user.getUserId());
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public ResponseEntity<List<ClassResponse>> getAllClasses(@AuthenticationPrincipal TssUserPrincipal principal) {
        Integer requesterUserId = null;
        if (principal != null) {
            // try to resolve a DB user id, if present
            var opt = userRepository.findByEmail(principal.getEmail());
            if (opt.isPresent()) requesterUserId = opt.get().getUserId();
        }
        return ResponseEntity.ok(classService.getAllClasses(requesterUserId));
    }

    @GetMapping("/course/{courseCode}")
    public ResponseEntity<List<ClassResponse>> getClassesByCourse(@PathVariable String courseCode,
                                                                   @AuthenticationPrincipal TssUserPrincipal principal) {
        Integer requesterUserId = null;
        if (principal != null) {
            var opt = userRepository.findByEmail(principal.getEmail());
            if (opt.isPresent()) requesterUserId = opt.get().getUserId();
        }
        return ResponseEntity.ok(classService.getClassesByCourse(courseCode, requesterUserId));
    }

    @GetMapping("/my-classes")
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<List<ClassResponse>> getMyClasses(
            @AuthenticationPrincipal TssUserPrincipal principal) {
        // Ensure the staff/student sub-profile exists before querying tutor classes
        userProfilePersistenceService.ensureUserSubProfilePersisted(principal);

        User user = userRepository.findByEmail(principal.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(classService.getClassesByTutor(user.getUserId()));
    }
}
