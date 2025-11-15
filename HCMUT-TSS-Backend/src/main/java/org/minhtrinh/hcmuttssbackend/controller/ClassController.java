package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.ClassResponse;
import org.minhtrinh.hcmuttssbackend.dto.CreateClassRequest;

import org.minhtrinh.hcmuttssbackend.service.ClassService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<ClassResponse> createClass(
            @RequestBody CreateClassRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        ClassResponse response = classService.createClass(request, principal);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<Void> deleteClass(
            @PathVariable Long id,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        classService.deleteClass(id, principal);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<ClassResponse> updateClass(
            @PathVariable Long id,
            @RequestBody org.minhtrinh.hcmuttssbackend.dto.UpdateClassRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        ClassResponse resp = classService.updateClass(id, request, principal);
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public ResponseEntity<List<ClassResponse>> getAllClasses(@AuthenticationPrincipal TssUserPrincipal principal) {
        return ResponseEntity.ok(classService.getAllClasses(principal));
    }

    @GetMapping("/course/{courseCode}")
    public ResponseEntity<List<ClassResponse>> getClassesByCourse(@PathVariable String courseCode,
                                                                   @AuthenticationPrincipal TssUserPrincipal principal) {
        return ResponseEntity.ok(classService.getClassesByCourse(courseCode, principal));
    }

    @GetMapping("/my-classes")
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<List<ClassResponse>> getMyClasses(
            @AuthenticationPrincipal TssUserPrincipal principal) {
        return ResponseEntity.ok(classService.getClassesByTutor(principal));
    }
}
