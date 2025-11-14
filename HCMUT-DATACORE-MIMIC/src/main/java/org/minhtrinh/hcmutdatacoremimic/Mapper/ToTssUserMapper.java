package org.minhtrinh.hcmutdatacoremimic.Mapper;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.minhtrinh.hcmutdatacoremimic.Dto.ToTssUserDto;
import org.minhtrinh.hcmutdatacoremimic.Model.CustomUser;
import org.minhtrinh.hcmutdatacoremimic.Model.Student;
import org.minhtrinh.hcmutdatacoremimic.Model.Type;
import org.minhtrinh.hcmutdatacoremimic.Model.UniversityStaff;

@Mapper(componentModel = "spring")
public interface ToTssUserMapper {

    @Mapping(source = "hostDepartment.departmentName", target = "departmentName")
    ToTssUserDto toTssUserDtoMapper(CustomUser customUser);

    @AfterMapping
    default void mapUserSubtypes(@MappingTarget ToTssUserDto dto, CustomUser customUser) {

        if (customUser instanceof Student) {
            // It's a Student
            dto.setUserType(Type.STUDENT.toString());
        }
        else if (customUser instanceof UniversityStaff) {
            UniversityStaff staff = (UniversityStaff) customUser;
            dto.setUserType(staff.getStaffType().toString());
        }
        // If it's neither (e.g., just a base CustomUser),
        // both fields will remain null.
    }
}
