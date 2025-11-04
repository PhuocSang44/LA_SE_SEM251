package org.minhtrinh.hcmutdatacoremimic.Model;



import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Student extends CustomUser{
    String major;
    String academic_Level;

    public Student(int OfficialID, String Email, String FirstName,
                   String MiddleName, String LastName, Type UserType, String Major,
                   String Academic_Level, Department hostDepartment) {
        super(OfficialID, Email, FirstName, MiddleName, LastName, UserType, hostDepartment);

        this.major = Major;
        this.academic_Level = Academic_Level;
    }
}
