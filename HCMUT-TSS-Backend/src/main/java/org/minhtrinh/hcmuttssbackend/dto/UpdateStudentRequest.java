package org.minhtrinh.hcmuttssbackend.dto;

import lombok.Data;

@Data
public class UpdateStudentRequest {
    private String departmentName;
    private String major;
    private String academicLevel;
}