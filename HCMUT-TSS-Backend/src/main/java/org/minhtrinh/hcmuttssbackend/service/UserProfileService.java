package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.minhtrinh.hcmuttssbackend.repository.UniversityStaffRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.entity.Student;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final UniversityStaffRepository universityStaffRepository;
    private final StudentRepository studentRepository;

    public UserProfileService(UserRepository userRepository, UniversityStaffRepository universityStaffRepository, StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.universityStaffRepository = universityStaffRepository;
        this.studentRepository = studentRepository;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    public UniversityStaff getTutorByUserId(Integer userId) {
        return universityStaffRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found for user id: " + userId));
    }

    public Student getStudentByUserId(Integer userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for user id: " + userId));
    }

    public Student getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for student id: " + studentId));
    }

    public UniversityStaff getTutorByEmail(String email) {
        User user = getUserByEmail(email);
        return universityStaffRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found for user email: " + email));
    }
}
