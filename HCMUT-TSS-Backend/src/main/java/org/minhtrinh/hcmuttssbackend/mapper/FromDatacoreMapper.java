package org.minhtrinh.hcmuttssbackend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.entity.UserType;

@Mapper(componentModel="spring")
public interface FromDatacoreMapper {

    @Mapping(target = "userId", ignore = true)
    @Mapping(source = "userType", target = "userType", qualifiedByName = "stringToUserType")
    User toUser(RecvDatacoreDto dto);

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
