package org.minhtrinh.hcmuttssbackend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.entity.*;

@Mapper(componentModel="spring")
public interface FromDatacoreMapper {

    @Mapping(source = "userType", target = "userType", qualifiedByName = "stringToUserType")
    User toUser(RecvDatacoreDto dto);

    @Mapping(source = "officialID", target = "studentId")
    Student toStudent(RecvDatacoreDto dto);
   
    @Mapping(source = "officialID", target = "staffId")
    UniversityStaff toUniversityStaff(RecvDatacoreDto dto);

    @Named("stringToUserType")
    default UserType stringToUserType(String userTypeString) {
        if (userTypeString == null) {
            return null;
        }
        try {
            return UserType.valueOf(userTypeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("Unknown userType received: " + userTypeString);
            return null;
        }
    }
}
