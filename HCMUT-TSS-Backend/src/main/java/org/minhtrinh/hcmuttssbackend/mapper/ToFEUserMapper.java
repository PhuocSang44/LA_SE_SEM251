package org.minhtrinh.hcmuttssbackend.mapper;

import org.mapstruct.Mapper;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.dto.ToFEUserDto;
import org.minhtrinh.hcmuttssbackend.entity.User;

import java.util.Optional;

@Mapper(componentModel = "spring")
public interface ToFEUserMapper {
    @org.mapstruct.Mapping(source = "userType", target = "userType", qualifiedByName = "toLowerCase")
    ToFEUserDto toFEUserDtoMapper(RecvDatacoreDto recvDatacoreDto);
    ToFEUserDto fromDBtoFEUserDto(Optional<User> user);

    @org.mapstruct.Named("toLowerCase")
    default String toLowerCase(String s) {
        return s == null ? null : s.toLowerCase();
    }

}
