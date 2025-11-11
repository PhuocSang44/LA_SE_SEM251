package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UniversityStaffRepository extends JpaRepository<UniversityStaff, Integer> {
    Optional<UniversityStaff> findByUser_UserId(Integer userId);
    Optional<UniversityStaff> findByStaffId(String staffId);
}
