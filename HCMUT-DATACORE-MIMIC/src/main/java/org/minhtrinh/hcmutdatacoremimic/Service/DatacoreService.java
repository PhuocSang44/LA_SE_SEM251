package org.minhtrinh.hcmutdatacoremimic.Service;

import jakarta.annotation.PostConstruct;
import org.minhtrinh.hcmutdatacoremimic.Model.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;

import static org.minhtrinh.hcmutdatacoremimic.Model.DptCode.*;
import static org.minhtrinh.hcmutdatacoremimic.Model.Type.*;

@Service
public class DatacoreService {

    private final HashMap<DptCode, Department> AllDepartments = new HashMap<>();
    private final HashMap<String, CustomUser> AllUsers = new HashMap<>();

    private void createDepartment(){
        Department compSci = new Department(CSE, "Computer Science & Engineering");
        Department chemEng = new Department(CHE, "Electrical Engineering");
        Department civilEng = new Department(FME, "Civil Engineering");

        AllDepartments.put(CSE, compSci);
        AllDepartments.put(CHE, chemEng);
        AllDepartments.put(FME, civilEng);
    }

    private void createUser(){
        Department compSci = AllDepartments.get(CSE);
        Department chemEng = AllDepartments.get(CHE); // Assuming you meant Chemical, not Electrical
        Department civilEng = AllDepartments.get(FME);
        
        Student s1 = new Student(2110001, "an.nguyen@hcmut.edu.vn", "An", "Van", "Nguyen",
                STUDENT, "Computer Science", "Undergraduate", compSci);
        AllUsers.put(s1.getEmail(), s1);

        Student s2 = new Student(2110002, "binh.le@hcmut.edu.vn", "Binh", "Minh", "Le",
                STUDENT, "Chemical Engineering", "Undergraduate", chemEng);
        AllUsers.put(s2.getEmail(), s2);

        Student s3 = new Student(2010003, "chi.tran@hcmut.edu.vn", "Chi", "Thi", "Tran",
                STUDENT, "Data Science", "Graduate", compSci);
        AllUsers.put(s3.getEmail(), s3);

        Student s4 = new Student(2210004, "dung.pham@hcmut.edu.vn", "Dung", "Huu", "Pham",
                STUDENT, "Civil Engineering", "Undergraduate", civilEng);
        AllUsers.put(s4.getEmail(), s4);

        Student s5 = new Student(1910005, "giang.vo@hcmut.edu.vn", "Giang", "Thanh", "Vo",
                STUDENT, "Telecommunications", "Graduate", chemEng);
        AllUsers.put(s5.getEmail(), s5);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        UniversityStaff staff1 = new UniversityStaff(5001, "thanh.nguyen@hcmut.edu.vn", "Thanh", "Cong", "Nguyen",
                STAFF, "Professor", compSci, StaffType.TUTOR);
        AllUsers.put(staff1.getEmail(), staff1);

        UniversityStaff staff2 = new UniversityStaff(5002, "hang.vu@hcmut.edu.vn", "Hang", "Thu", "Vu",
                STAFF, "Department Secretary", compSci, StaffType.COOPERATOR);
        AllUsers.put(staff2.getEmail(), staff2);

        UniversityStaff staff3 = new UniversityStaff(5003, "long.dinh@hcmut.edu.vn", "Long", "Bao", "Dinh",
                STAFF, "Lecturer", chemEng, StaffType.TUTOR);
        AllUsers.put(staff3.getEmail(), staff3);

        UniversityStaff staff4 = new UniversityStaff(5004, "phuong.mai@hcmut.edu.vn", "Phuong", "Anh", "Mai",
                STAFF, "Researcher", civilEng, StaffType.TUTOR);
        AllUsers.put(staff4.getEmail(), staff4);

        UniversityStaff staff5 = new UniversityStaff(5005, "tuan.ly@hcmut.edu.vn", "Tuan", "Anh", "Ly",
                STAFF, "Academic Advisor", civilEng, StaffType.ADMINISTRATOR);
        AllUsers.put(staff5.getEmail(), staff5);
    }

    @PostConstruct
    public void initData() {
        createDepartment();
        createUser();
    }


    //Getter
    public CustomUser getUserByEmail(String email) {
        return AllUsers.get(email);
    }
    public Department getDepartmentByCode(DptCode code) {
        return AllDepartments.get(code);
    }
}


