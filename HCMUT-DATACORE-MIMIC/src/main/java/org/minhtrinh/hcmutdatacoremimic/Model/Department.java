package org.minhtrinh.hcmutdatacoremimic.Model;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class Department {
    DptCode departmentCode;
    public String departmentName;

    public Department(DptCode dptCode, String DepartmentName) {
        this.departmentCode = dptCode;
        this.departmentName = DepartmentName;

    }

    // May add more attribute to contain Course
}
