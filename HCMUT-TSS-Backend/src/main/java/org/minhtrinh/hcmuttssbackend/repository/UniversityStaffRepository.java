package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UniversityStaffRepository extends JpaRepository<UniversityStaff, Integer> {
    @Query("select us from UniversityStaff us left join fetch us.department left join fetch us.user where us.userId = :userId")
    Optional<UniversityStaff> findByUserId(@Param("userId") Integer userId);
    
    Optional<UniversityStaff> findByStaffId(String staffId);
    List<UniversityStaff> findByDepartment_DepartmentName(String departmentName);
    List<UniversityStaff> findByUserIdIn(List<Integer> userIds);
}
