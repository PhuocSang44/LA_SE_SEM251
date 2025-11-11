package org.minhtrinh.hcmuttssbackend.service;


import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.entity.*;
import org.minhtrinh.hcmuttssbackend.mapper.FromDatacoreMapper;
import org.minhtrinh.hcmuttssbackend.mapper.ToFEUserMapper;
import org.minhtrinh.hcmuttssbackend.repository.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Optional;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final UniversityStaffRepository universityStaffRepository;
    private final DepartmentRepository departmentRepository;
    private final WebClient datacoreWebClient;
    private final FromDatacoreMapper fromDatacoreMapper;
    
    public UserService(UserRepository userRepository,
                        StudentRepository studentRepository,
                       UniversityStaffRepository universityStaffRepository,
                        DepartmentRepository departmentRepository,
                       WebClient datacoreWebClient,
                       FromDatacoreMapper fromDatacoreMapper) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.universityStaffRepository = universityStaffRepository;
        this.departmentRepository = departmentRepository;
        this.datacoreWebClient = datacoreWebClient;
        this.fromDatacoreMapper = fromDatacoreMapper;
    }

    public void getAndStoreUserFromDatacore(@AuthenticationPrincipal TssUserPrincipal principal){
        String email = principal.getEmail();
        if (userRepository.findByEmail(email).isPresent())
            return;
        
        RecvDatacoreDto datacoreUser = datacoreWebClient.get()
                .uri("/users/by-email/{email}", email)
                .retrieve()
                .bodyToMono(RecvDatacoreDto.class).block();
        if (datacoreUser == null)
            throw new RuntimeException("User not found in Datacore");
        Department department = departmentRepository.findByDepartmentCode(datacoreUser.departmentCode())
                .orElseGet(() -> {
                    System.out.println("Creating new department...");
                    Department newDepartment =  Department.builder()
                            .departmentCode(datacoreUser.departmentCode())
                            .departmentName(datacoreUser.departmentName())
                            .build();
                    return departmentRepository.save(newDepartment);
                }
                );
        User user = fromDatacoreMapper.toUser(datacoreUser);
        userRepository.save(user);
        if ("STUDENT".equals(datacoreUser.userType())) {
            createStudent(datacoreUser, user, department);
        } else if ("STAFF".equals(datacoreUser.userType())) {
            createStaff(datacoreUser, user, department);
        } else throw new IllegalArgumentException("Unknown userType: " + datacoreUser.userType());
    }

    private void createStudent(RecvDatacoreDto dto, User user, Department department){
        Student student = fromDatacoreMapper.toStudent(dto);
        student.setUser(user);
        student.setDepartment(department);
        studentRepository.save(student);
    }
    private void createStaff(RecvDatacoreDto dto, User user, Department department){
        UniversityStaff staff = fromDatacoreMapper.toUniversityStaff(dto);
        staff.setUser(user);
        staff.setDepartment(department);
        universityStaffRepository.save(staff);
    }
    public Optional<User> getUserFromDatabase(@AuthenticationPrincipal TssUserPrincipal principal){
        return userRepository.findByEmail(principal.getEmail());
    }
}
