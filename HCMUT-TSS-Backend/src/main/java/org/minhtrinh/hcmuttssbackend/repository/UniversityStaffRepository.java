package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UniversityStaffRepository extends JpaRepository<UniversityStaff, Long> {
    Optional<UniversityStaff> findByOfficialId(Long officialId);
    Optional<UniversityStaff> findByUserId(Integer userId);
}
