package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.ActivityLogResponse;
import org.minhtrinh.hcmuttssbackend.dto.AdminUserResponse;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.entity.UserType;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.minhtrinh.hcmuttssbackend.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final AdminService adminService;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService, 
                          UserRepository userRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
    }

    /**
     * Check if current user is an administrator
     */
    private boolean isAdmin(TssUserPrincipal principal) {
        return userRepository.findByEmail(principal.getEmail())
                .map(user -> user.getUserType() == UserType.ADMINISTRATOR || 
                             user.getUserType() == UserType.COOPERATOR)
                .orElse(false);
    }

    /**
     * Get all users in the system
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal TssUserPrincipal principal) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Administrator privileges required.");
        }

        try {
            List<AdminUserResponse> users = adminService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching users: " + e.getMessage());
        }
    }

    /**
     * Delete a user from the system
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Integer userId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        
        if (!isAdmin(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Administrator privileges required.");
        }

        try {
            User adminUser = userRepository.findByEmail(principal.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));

            // Prevent deleting yourself
            if (userId.equals(adminUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cannot delete your own account");
            }

            adminService.deleteUser(userId, adminUser.getUserId());
            return ResponseEntity.ok("User deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error deleting user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting user: " + e.getMessage());
        }
    }

    /**
     * Ban a user
     */
    @PatchMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(
            @PathVariable Integer userId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        
        if (!isAdmin(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Administrator privileges required.");
        }

        try {
            User adminUser = userRepository.findByEmail(principal.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));

            // Prevent banning yourself
            if (userId.equals(adminUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cannot ban your own account");
            }

            adminService.banUser(userId, adminUser.getUserId());
            return ResponseEntity.ok("User banned successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error banning user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error banning user: " + e.getMessage());
        }
    }

    /**
     * Unban a user
     */
    @PatchMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(
            @PathVariable Integer userId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        
        if (!isAdmin(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Administrator privileges required.");
        }

        try {
            User adminUser = userRepository.findByEmail(principal.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));

            adminService.unbanUser(userId, adminUser.getUserId());
            return ResponseEntity.ok("User unbanned successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error unbanning user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error unbanning user: " + e.getMessage());
        }
    }

    /**
     * Get all activity logs
     */
    @GetMapping("/logs")
    public ResponseEntity<?> getAllLogs(@AuthenticationPrincipal TssUserPrincipal principal) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Administrator privileges required.");
        }

        try {
            List<ActivityLogResponse> logs = adminService.getAllActivityLogs();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching logs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching logs: " + e.getMessage());
        }
    }
}
