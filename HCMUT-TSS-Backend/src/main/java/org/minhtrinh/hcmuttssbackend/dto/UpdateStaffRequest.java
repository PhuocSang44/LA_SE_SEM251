package org.minhtrinh.hcmuttssbackend.dto;

import lombok.Data;

@Data
public class UpdateStaffRequest {
    private String departmentName;
    private String positionTitle;
    private String specialization;
}