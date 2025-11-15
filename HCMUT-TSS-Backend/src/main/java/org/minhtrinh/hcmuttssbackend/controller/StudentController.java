package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.UpdateStudentRequest;
import org.minhtrinh.hcmuttssbackend.entity.User; // <-- THÊM IMPORT
import org.minhtrinh.hcmuttssbackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional; // <-- THÊM IMPORT

/**
 * Controller xử lý các yêu cầu cập nhật thông tin
 * dành riêng cho Sinh viên (Student).
 */
@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final UserService userService;

    public StudentController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint cho Sinh viên cập nhật thông tin profile của chính họ.
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @AuthenticationPrincipal TssUserPrincipal principal, 
            @RequestBody UpdateStudentRequest request) {

        Optional<User> userOpt = userService.getUserFromDatabase(principal);
        User user = userOpt.orElseThrow(() -> 
            new RuntimeException("User not found in database for email: " + principal.getEmail()));

        Integer userId = user.getUserId(); 
        
        userService.updateStudentProfile(userId, request);
        return ResponseEntity.ok("Student profile updated successfully.");
    }
}