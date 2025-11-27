package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.minhtrinh.hcmuttssbackend.repository.UniversityStaffRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final UniversityStaffRepository universityStaffRepository;

    public UserProfileService(UserRepository userRepository, UniversityStaffRepository universityStaffRepository) {
        this.userRepository = userRepository;
        this.universityStaffRepository = universityStaffRepository;
    }

    public User getUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    public UniversityStaff getTutorByUserIdOrThrow(Integer userId) {
        return universityStaffRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found for user id: " + userId));
    }
}
