package org.minhtrinh.hcmutdatacoremimic.Model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UniversityStaff extends CustomUser{
    String role;
    Department hostDepartment;
    StaffType staffType;

    public UniversityStaff(int OfficialID, String Email,
                           String FirstName, String MiddleName, String LastName, Type UserType,
                           String Role, Department HostDepartment, StaffType staffType) {
        super(OfficialID, Email, FirstName, MiddleName, LastName, UserType, HostDepartment);

        this.role = Role;
        this.staffType = staffType;
    }
}
