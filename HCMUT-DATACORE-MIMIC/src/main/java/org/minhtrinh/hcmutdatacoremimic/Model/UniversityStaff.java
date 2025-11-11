package org.minhtrinh.hcmutdatacoremimic.Model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UniversityStaff extends CustomUser{
    String role;
    StaffType staffType;

    public UniversityStaff(int OfficialID, String Email,
                           String FirstName, String MiddleName, String LastName, Type UserType,
                           String Role, Department hostDepartment, StaffType staffType) {
        super(OfficialID, Email, FirstName, MiddleName, LastName, UserType, hostDepartment);

        this.role = Role;
        this.staffType = staffType;
    }
}
