package org.minhtrinh.hcmuttssbackend.dto;

import java.io.Serial;
import java.io.Serializable; // 1. Import this

// 2. Add "implements Serializable" here
public record RecvDatacoreDto(
        Integer officialID,
        String email,
        String firstName,
        String middleName,
        String lastName,
        String userType, 

        //Student
        String major,
        String academicLevel,

        //Staff
        String staffRole,
        String staffType,

        String departmentCode,
        String departmentName
) implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
}