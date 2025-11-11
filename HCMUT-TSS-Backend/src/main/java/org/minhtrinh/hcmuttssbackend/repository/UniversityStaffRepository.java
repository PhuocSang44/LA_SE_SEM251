package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UniversityStaffRepository extends JpaRepository<UniversityStaff, Integer> {
    Optional<UniversityStaff> findByUser_Email(String email);
    Optional<UniversityStaff> findByUser_UserId(Integer userId);
    List<UniversityStaff> findByDepartment_DepartmentCode(String departmentCode);
    List<UniversityStaff> findByStaffRole(String staffRole);

    // Check if university staff exists by email
    boolean existsByUser_Email(String email);
}