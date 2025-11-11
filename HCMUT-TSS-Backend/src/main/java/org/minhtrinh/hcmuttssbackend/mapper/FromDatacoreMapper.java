package org.minhtrinh.hcmuttssbackend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.entity.*;

@Mapper(componentModel="spring")
public interface FromDatacoreMapper {

    @Mapping(target = "userId", ignore = true)
    @Mapping(source = "userType", target = "userType", qualifiedByName = "stringToUserType")
    User toUser(RecvDatacoreDto dto);
    // Map DTO → Student entity
    @Mapping(source = "officialID", target = "studentId")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "department", ignore = true)
    Student toStudent(RecvDatacoreDto dto);
    // Map DTO → UniversityStaff entity
    @Mapping(source = "officialID", target = "staffId")
    @Mapping(source = "staffRole", target = "staffRole")
    @Mapping(source = "staffType", target = "staffType", qualifiedByName = "stringToStaffType")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "department", ignore = true)
    UniversityStaff toUniversityStaff(RecvDatacoreDto dto);

    @Named("stringToUserType")
    default UserType stringToUserType(String userTypeString) {
        if (userTypeString == null) return null;
        
        // Handle DATACORE's "STAFF" → TSS's "UNIVERSITY_STAFF"
        if (userTypeString.equalsIgnoreCase("STAFF")) {
            return UserType.UNIVERSITY_STAFF;
        }
        try {
            return UserType.valueOf(userTypeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("Unknown userType received: " + userTypeString);
            return null;
        }
    }

    @Named("stringToStaffType")
    default StaffType stringToStaffType(String staffTypeString) {
        if (staffTypeString == null) return null;
        try {
            return StaffType.valueOf(staffTypeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("Unknown staffType received: " + staffTypeString);
            return null;
        }
    }
}
