package org.minhtrinh.hcmuttssbackend.dto;

import lombok.Data;

@Data
public class UpdateStudentRequest {
    private String departmentName;
    private String program;
    private String academicLevel;
}