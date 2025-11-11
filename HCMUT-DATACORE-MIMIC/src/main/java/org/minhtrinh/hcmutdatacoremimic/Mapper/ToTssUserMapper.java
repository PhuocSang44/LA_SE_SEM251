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

    @Mapping(source = "officialID", target = "officialID")
    @Mapping(source = "userType", target = "userType")
    @Mapping(source = "hostDepartment.departmentCode", target = "departmentCode")
    @Mapping(source = "hostDepartment.departmentName", target = "departmentName")
    @Mapping(target = "academicLevel", ignore = true)
    @Mapping(target = "major", ignore = true)
    @Mapping(target = "staffRole", ignore = true)
    @Mapping(target = "staffType", ignore = true)
    ToTssUserDto toTssUserDtoMapper(CustomUser customUser);

    @AfterMapping
    default void mapUserSubtypes(@MappingTarget ToTssUserDto dto, CustomUser customUser) {

        if (customUser instanceof Student student) {
            // It's a Student
            dto.setUserType(Type.STUDENT.toString());
            dto.setMajor(student.getMajor());
            dto.setAcademicLevel(student.getAcademic_Level());
            dto.setStaffRole(null);
            dto.setStaffType(null);
        }
        else if (customUser instanceof UniversityStaff staff) {
            dto.setUserType(Type.STAFF.toString());
            dto.setStaffRole(staff.getRole().toString());
            dto.setStaffType(staff.getStaffType().toString());
            dto.setMajor(null);
            dto.setAcademicLevel(null);
        }
        // If it's neither (e.g., just a base CustomUser),
        // both fields will remain null.
    }
}
