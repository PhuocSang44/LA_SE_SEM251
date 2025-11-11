package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {
    Optional<Department> findByDepartmentCode(String departmentCode);
    Optional<Department> findByDepartmentName(String departmentName);
    
    //Check if department exists by name
    boolean existsByDepartmentName(String departmentName);
}