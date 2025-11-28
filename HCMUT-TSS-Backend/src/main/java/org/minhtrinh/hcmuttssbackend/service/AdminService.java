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
    private final ActivityLogService activityLogService;

    public AdminService(UserRepository userRepository,
                        StudentRepository studentRepository,
                        UniversityStaffRepository universityStaffRepository,
                        ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.universityStaffRepository = universityStaffRepository;
        this.activityLogService = activityLogService;
    }

    public List<AdminUserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<AdminUserResponse> responses = new ArrayList<>();

        if (users.isEmpty()) return responses;

        List<Integer> userIds = users.stream().map(User::getUserId).collect(Collectors.toList());

        List<Student> students = studentRepository.findByUserIdIn(userIds);
        List<UniversityStaff> staffs = universityStaffRepository.findByUserIdIn(userIds);

        var studentMap = students.stream().collect(Collectors.toMap(Student::getUserId, s -> s));
        var staffMap = staffs.stream().collect(Collectors.toMap(UniversityStaff::getUserId, s -> s));

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
                Student student = studentMap.get(user.getUserId());
                if (student != null) {
                    response.setStudentId(student.getStudentId());
                    response.setMajor(student.getMajor());
                    response.setAcademicLevel(student.getAcademicLevel());
                    if (student.getDepartment() != null) response.setDepartmentName(student.getDepartment().getDepartmentName());
                    response.setRole("STUDENT");
                }
            } else {
                UniversityStaff staff = staffMap.get(user.getUserId());
                if (staff != null) {
                    response.setStaffId(staff.getStaffId());
                    response.setPosition(staff.getPosition());
                    if (staff.getDepartment() != null) response.setDepartmentName(staff.getDepartment().getDepartmentName());
                    response.setRole(staff.getRole());
                }
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
            studentRepository.findByUserId(userId).ifPresent(studentRepository::delete);
        } else {
            universityStaffRepository.findByUserId(userId).ifPresent(universityStaffRepository::delete);
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
        List<ActivityLog> logs = activityLogService.findAll()
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
        activityLogService.saveLogRequiresNew(log);
    }

    /**
     * Check if user is an administrator or cooperator
     */
    public boolean isUserAdmin(String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getUserType() == UserType.ADMINISTRATOR || 
                             user.getUserType() == UserType.COOPERATOR)
                .orElse(false);
    }

    /**
     * Check if the target userId belongs to the user with given email
     */
    public boolean isSameUser(Integer targetUserId, String userEmail) {
        return userRepository.findByEmail(userEmail)
                .map(user -> user.getUserId().equals(targetUserId))
                .orElse(false);
    }

    /**
     * Get admin user ID by email
     */
    public Integer getAdminUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
    }
}
