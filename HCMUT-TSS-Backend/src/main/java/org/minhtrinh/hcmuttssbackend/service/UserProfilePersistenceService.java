//vuong
package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.entity.*;
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

    public UserProfilePersistenceService(WebClient datacoreWebClient, UserRepository userRepository, StudentRepository studentRepository,                                     UniversityStaffRepository staffRepository) {
        this.datacoreWebClient = datacoreWebClient;
        this.userRepository = userRepository;  
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
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
        // Ensure departmentName is non-null because DB columns are not nullable
        String deptName = dto.departmentName() == null ? "" : dto.departmentName();

        if (userType == UserType.STUDENT) {
            studentRepository.findByUserId(user.getUserId()).or(() -> studentRepository.findByOfficialId(Long.valueOf(dto.officialID())))
            .orElseGet(() -> studentRepository.save(
                            Student.builder().userId(user.getUserId())
                                    .officialId(Long.valueOf(dto.officialID()))
                                    .departmentName(deptName)
                                    .program(null)
                                    .academicLevel(null)
                                    .build()
            ));
        } else {
            // TUTOR/ADMIN are staff sub-types
            staffRepository.findByUserId(user.getUserId()).or(() -> staffRepository.findByOfficialId(Long.valueOf(dto.officialID())))
            .orElseGet(() -> staffRepository.save(
                            UniversityStaff.builder()
                                    .userId(user.getUserId())
                                    .officialId(Long.valueOf(dto.officialID()))
                                    .positionTitle(null)
                                    .departmentName(deptName)
                                    .build()
            ));
        }
    }
}
