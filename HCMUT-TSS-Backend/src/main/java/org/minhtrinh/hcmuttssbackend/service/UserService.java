package org.minhtrinh.hcmuttssbackend.service;


import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.dto.UpdateStaffRequest;
import org.minhtrinh.hcmuttssbackend.dto.UpdateStudentRequest;
import org.minhtrinh.hcmuttssbackend.entity.Student;
import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.minhtrinh.hcmuttssbackend.mapper.FromDatacoreMapper;
import org.minhtrinh.hcmuttssbackend.mapper.ToFEUserMapper;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.repository.UniversityStaffRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final WebClient datacoreWebClient;
    private final FromDatacoreMapper fromDatacoreMapper;
    // --- THÊM REPOSITORIES ---
    private final StudentRepository studentRepository;
    private final UniversityStaffRepository staffRepository;
    // --- HẾT THÊM ---
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepository userRepository,
                       WebClient datacoreWebClient,
                       FromDatacoreMapper fromDatacoreMapper,
                       // --- THÊM VÀO CONSTRUCTOR ---
                       StudentRepository studentRepository,
                       UniversityStaffRepository staffRepository) {
        this.userRepository = userRepository;
        this.datacoreWebClient = datacoreWebClient;
        this.fromDatacoreMapper = fromDatacoreMapper;
        // --- THÊM VÀO CONSTRUCTOR ---
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
    }

    @Transactional
    public void getAndStoreUserFromDatacore(@AuthenticationPrincipal TssUserPrincipal principal){

        RecvDatacoreDto datacoreUser = datacoreWebClient.get()
                .uri("/users/by-email/{email}", principal.getEmail())
                .retrieve()
                .bodyToMono(RecvDatacoreDto.class).block();

        if (datacoreUser == null) {
            log.warn("Datacore returned no user for email={}", principal.getEmail());
            return;
        }

        User incoming = fromDatacoreMapper.toUser(datacoreUser);

        // Upsert: if user exists by email, update fields; otherwise insert
        Optional<User> existingOpt = userRepository.findByEmail(incoming.getEmail());
        if (existingOpt.isPresent()) {
            User existing = existingOpt.get();
            // Update commonly synced fields
            existing.setFirstName(incoming.getFirstName());
            existing.setLastName(incoming.getLastName());
            existing.setMiddleName(incoming.getMiddleName());
            existing.setEmail(incoming.getEmail());
            existing.setUserType(incoming.getUserType());
            userRepository.save(existing);
            log.debug("Updated existing user {} from datacore", existing.getEmail());
        } else {
            userRepository.save(incoming);
            log.debug("Inserted new user {} from datacore", incoming.getEmail());
        }
    }

    public Optional<User> getUserFromDatabase(@AuthenticationPrincipal TssUserPrincipal principal){
        return userRepository.findByEmail(principal.getEmail());
    }

    // --- STAFF ---
    @Transactional
    public void updateStaffProfile(Integer userId, UpdateStaffRequest request) {
        UniversityStaff staff = staffRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Staff profile not found for user: " + userId));
        staff.setDepartmentName(request.getDepartmentName());
        staff.setPositionTitle(request.getPositionTitle());
        staff.setSpecialization(request.getSpecialization());

        staffRepository.save(staff);
    }

    // --- STUDENT ---
    @Transactional
    public void updateStudentProfile(Integer userId, UpdateStudentRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + userId));
        student.setDepartmentName(request.getDepartmentName());
        student.setProgram(request.getProgram());
        student.setAcademicLevel(request.getAcademicLevel());

        studentRepository.save(student);
    }
}
