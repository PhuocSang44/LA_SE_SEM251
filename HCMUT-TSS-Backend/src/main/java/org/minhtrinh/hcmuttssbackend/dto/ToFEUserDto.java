// org/minhtrinh/hcmuttssbackend/dto/ToFEUserDto.java
package org.minhtrinh.hcmuttssbackend.dto;

// Change "class" to "record"
public record ToFEUserDto(
        String officialID,
        String email,
        String firstName,
        String middleName,
        String lastName,
        String userType,
        String departmentName// <-?
) {}