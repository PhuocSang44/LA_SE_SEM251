package org.minhtrinh.hcmuttssbackend.dto;

import java.io.Serializable; // 1. Import this

// 2. Add "implements Serializable" here
public record RecvDatacoreDto(
        String officialID,
        String email,
        String firstName,
        String middleName,
        String lastName,
        String userType,
        String departmentName
) implements Serializable {}