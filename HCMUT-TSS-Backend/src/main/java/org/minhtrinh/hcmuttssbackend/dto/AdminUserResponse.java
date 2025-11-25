package org.minhtrinh.hcmuttssbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.minhtrinh.hcmuttssbackend.entity.UserStatus;
import org.minhtrinh.hcmuttssbackend.entity.UserType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Integer userId;
    private String email;
    private String firstName;
    private String middleName;
    private String lastName;
    private UserType userType;
    private UserStatus status;
    private String departmentName;
    private String role;
    
    // Student-specific fields
    private String studentId;
    private String major;
    private String academicLevel;
    
    // Staff-specific fields
    private String staffId;
    private String position;
}
