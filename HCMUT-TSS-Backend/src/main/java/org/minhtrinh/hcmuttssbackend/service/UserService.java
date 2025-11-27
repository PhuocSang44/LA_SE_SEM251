package org.minhtrinh.hcmuttssbackend.service;


import jakarta.transaction.Transactional;
import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.dto.UpdateStudentRequest;
import org.minhtrinh.hcmuttssbackend.dto.UpdateStaffRequest;
import org.minhtrinh.hcmuttssbackend.entity.*;
import org.minhtrinh.hcmuttssbackend.mapper.FromDatacoreMapper;
import org.minhtrinh.hcmuttssbackend.mapper.ToFEUserMapper;
import org.minhtrinh.hcmuttssbackend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;


@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final UniversityStaffRepository universityStaffRepository;
    private final DepartmentRepository departmentRepository;
    private final WebClient datacoreWebClient;
    private final FromDatacoreMapper fromDatacoreMapper;
    private final UserProfilePersistenceService userProfilePersistenceService;
    
    public UserService(UserRepository userRepository,
                        StudentRepository studentRepository,
                       UniversityStaffRepository universityStaffRepository,
                        DepartmentRepository departmentRepository,
                       WebClient datacoreWebClient,
                       FromDatacoreMapper fromDatacoreMapper,
                       UserProfilePersistenceService userProfilePersistenceService
                       ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.universityStaffRepository = universityStaffRepository;
        this.departmentRepository = departmentRepository;
        this.datacoreWebClient = datacoreWebClient;
        this.fromDatacoreMapper = fromDatacoreMapper;
        this.userProfilePersistenceService = userProfilePersistenceService;
    }

    @Transactional
    public User getAndStoreUserFromDatacore(@AuthenticationPrincipal TssUserPrincipal principal){
        String email = principal.getEmail();
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent())
            return existingUser.get();

        RecvDatacoreDto datacoreUser = datacoreWebClient.get()
                .uri("/users/by-email/{email}", email)
                .retrieve()
                .bodyToMono(RecvDatacoreDto.class).block();
        //Debugging
        System.out.println("Datacore user fetched: " + datacoreUser);
        if (datacoreUser == null)
            throw new RuntimeException("User not found in Datacore");
        User user = fromDatacoreMapper.toUser(datacoreUser);
        User savedUser = userRepository.save(user);

        // Prevent dyp
        userProfilePersistenceService.persistSubProfileFromDto(savedUser, datacoreUser);

        return savedUser;
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

    @Transactional
    public void updateStaffProfile(Integer userId, UpdateStaffRequest request) {
        UniversityStaff staff = universityStaffRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Staff profile not found for user: " + userId));
        staff.setDepartment(
                departmentRepository.findByDepartmentName(request.getDepartmentName())
                        .orElseThrow(() -> new IllegalArgumentException("Department not found: " + request.getDepartmentName()))
        );

        universityStaffRepository.save(staff);
    }
    @Transactional
    public void updateStudentProfile(Integer userId, UpdateStudentRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for user: " + userId));
        student.setDepartment(
                departmentRepository.findByDepartmentName(request.getDepartmentName())
                        .orElseThrow(() -> new IllegalArgumentException("Department not found: " + request.getDepartmentName()))
        );
        student.setMajor(request.getMajor());
        student.setAcademicLevel(request.getAcademicLevel());

        studentRepository.save(student);
    }
}
