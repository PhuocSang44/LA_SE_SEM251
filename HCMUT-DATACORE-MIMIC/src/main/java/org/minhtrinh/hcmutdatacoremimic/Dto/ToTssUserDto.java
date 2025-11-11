package org.minhtrinh.hcmutdatacoremimic.Dto;


import org.minhtrinh.hcmutdatacoremimic.Model.Department;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ToTssUserDto {
    // fields passed to TSS backend
    Integer officialID;
    String email;
    String firstName;
    String middleName;
    String lastName;
    String userType;
    //Student
    String major;
    String academicLevel;
    //Staff
    String staffRole;
    String staffType;

    String departmentCode;
    String departmentName;
} 
