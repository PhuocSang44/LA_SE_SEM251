package org.minhtrinh.hcmutdatacoremimic.Model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class CustomUser {
    int officialID;
    String email;
    String firstName;
    String middleName;
    String lastName;
    Type userType;// ENUM
    Department hostDepartment;

    CustomUser(int OfficialID, String Email, String FirstName,
               String MiddleName, String LastName, Type UserType, Department HostDepartment) {
        this.officialID = OfficialID;
        this.email = Email;
        this.firstName = FirstName;
        this.middleName = MiddleName;
        this.lastName = LastName;
        this.userType = UserType;
        this.hostDepartment = HostDepartment;
    }
}
