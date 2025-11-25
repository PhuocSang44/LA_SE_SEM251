package org.minhtrinh.hcmuttssbackend.service;

import jakarta.transaction.Transactional;
import org.minhtrinh.hcmuttssbackend.dto.ActivityLogResponse;
import org.minhtrinh.hcmuttssbackend.dto.AdminUserResponse;
import org.minhtrinh.hcmuttssbackend.entity.*;
import org.minhtrinh.hcmuttssbackend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final UniversityStaffRepository universityStaffRepository;
    private final ActivityLogRepository activityLogRepository;

    public AdminService(UserRepository userRepository,
                        StudentRepository studentRepository,
                        UniversityStaffRepository universityStaffRepository,
                        ActivityLogRepository activityLogRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.universityStaffRepository = universityStaffRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public List<AdminUserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<AdminUserResponse> responses = new ArrayList<>();

        for (User user : users) {
            AdminUserResponse response = AdminUserResponse.builder()
                    .userId(user.getUserId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .middleName(user.getMiddleName())
                    .lastName(user.getLastName())
                    .userType(user.getUserType())
                    .status(user.getStatus())
                    .build();

            if (user.getUserType() == UserType.STUDENT) {
                studentRepository.findByUser_UserId(user.getUserId()).ifPresent(student -> {
                    response.setStudentId(student.getStudentId());
                    response.setMajor(student.getMajor());
                    response.setAcademicLevel(student.getAcademicLevel());
                    response.setDepartmentName(student.getDepartment().getDepartmentName());
                    response.setRole("STUDENT");
                });
            } else {
                universityStaffRepository.findByUser_UserId(user.getUserId()).ifPresent(staff -> {
                    response.setStaffId(staff.getStaffId());
                    response.setPosition(staff.getPosition());
                    response.setDepartmentName(staff.getDepartment().getDepartmentName());
                    response.setRole(staff.getRole());
                });
            }

            responses.add(response);
        }

        return responses;
    }

    @Transactional
    public void deleteUser(Integer userId, Integer adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Log the deletion
        logActivity(adminUserId, "DELETE_USER", "USER", userId.longValue(),
                "Admin deleted user: " + user.getEmail());

        // Delete related records based on user type
        if (user.getUserType() == UserType.STUDENT) {
            studentRepository.findByUser_UserId(userId).ifPresent(studentRepository::delete);
        } else {
            universityStaffRepository.findByUser_UserId(userId).ifPresent(universityStaffRepository::delete);
        }

        userRepository.delete(user);
        log.info("User deleted: {}", userId);
    }

    @Transactional
    public void banUser(Integer userId, Integer adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);

        // Log the ban
        logActivity(adminUserId, "BAN_USER", "USER", userId.longValue(),
                "Admin banned user: " + user.getEmail());

        log.info("User banned: {}", userId);
    }

    @Transactional
    public void unbanUser(Integer userId, Integer adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        // Log the unban
        logActivity(adminUserId, "UNBAN_USER", "USER", userId.longValue(),
                "Admin unbanned user: " + user.getEmail());

        log.info("User unbanned: {}", userId);
    }

    public List<ActivityLogResponse> getAllActivityLogs() {
        List<ActivityLog> logs = activityLogRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        return logs.stream().map(log -> {
            ActivityLogResponse response = ActivityLogResponse.builder()
                    .logId(log.getLogId())
                    .userId(log.getUserId())
                    .action(log.getAction())
                    .entityType(log.getEntityType())
                    .entityId(log.getEntityId())
                    .description(log.getDescription())
                    .createdAt(log.getCreatedAt())
                    .build();

            // Fetch user details
            userRepository.findById(log.getUserId()).ifPresent(user -> {
                response.setUserEmail(user.getEmail());
                response.setUserName(user.getFirstName() + " " + user.getLastName());
            });

            return response;
        }).collect(Collectors.toList());
    }

    private void logActivity(Integer userId, String action, String entityType, Long entityId, String description) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
    }
}
