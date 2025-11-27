//vuong
package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.entity.*;
import org.minhtrinh.hcmuttssbackend.repository.DepartmentRepository;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.repository.UniversityStaffRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class UserProfilePersistenceService {

    private final WebClient datacoreWebClient;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final UniversityStaffRepository staffRepository;
    private final DepartmentRepository departmentRepository;

    public UserProfilePersistenceService(WebClient datacoreWebClient,
                                         UserRepository userRepository,
                                         StudentRepository studentRepository,
                                         UniversityStaffRepository staffRepository,
                                         DepartmentRepository departmentRepository) {
        this.datacoreWebClient = datacoreWebClient;
        this.userRepository = userRepository;  
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public void ensureUserSubProfilePersisted(@AuthenticationPrincipal TssUserPrincipal principal) {
        // Find user in DB (should already exist) (2 layers sờ ku ri ti)
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new IllegalStateException("User not found in DB; call user sync first"));

        // Fetch detailed info from DataCore
        RecvDatacoreDto dto = datacoreWebClient.get().uri("/users/by-email/{email}", principal.getEmail())
            .retrieve().bodyToMono(RecvDatacoreDto.class).block();

        if (dto == null) {
            throw new IllegalStateException("Datacore returned null for user: " + principal.getEmail());
        }

        // Persist into Student or UniversityStaff table based on resolved userType
        UserType userType = user.getUserType();

        persistSubProfileFromDto(user, dto);
    }

    @Transactional
    public void persistSubProfileFromDto(User user, RecvDatacoreDto dto) {
        if (dto == null) throw new IllegalArgumentException("Datacore DTO is required");

        Department department = departmentRepository.findByDepartmentName(dto.departmentName()).orElse(null);
        if (department == null) {
            try {
                department = departmentRepository.save(
                        Department.builder().departmentName(dto.departmentName()).build()
                );
            } catch (Exception ex) {
                // Another thread may have inserted the department concurrently
                department = departmentRepository.findByDepartmentName(dto.departmentName()).orElse(null);
                if (department == null) throw ex;
            }
        }

        UserType userType = user.getUserType();
        if (userType == UserType.STUDENT) {
            boolean exists = studentRepository.findByUserId(user.getUserId()).isPresent();
            if (!exists) {
            Student s = Student.builder()
                .user(user)
                .studentId(dto.officialID())
                .department(department)
                .major(dto.major())
                .academicLevel(dto.academicLevel())
                .build();
            studentRepository.save(s);
            }
        } else {
            boolean exists = staffRepository.findByUserId(user.getUserId()).isPresent();
            if (!exists) {
            UniversityStaff st = UniversityStaff.builder()
                .user(user)
                .staffId(dto.officialID())
                .department(department)
                .build();
            staffRepository.save(st);
            }
        }
    }
}
