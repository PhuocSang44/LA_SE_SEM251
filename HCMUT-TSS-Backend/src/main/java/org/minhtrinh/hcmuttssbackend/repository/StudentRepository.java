package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByUser_Email(String email);
    Optional<Student> findByUser_UserId(Integer userId);
    List<Student> findByDepartment_DepartmentCode(String departmentCode);
    List<Student> findByMajor(String major);
    List<Student> findByAcademicLevel(String academicLevel);

    // Check if student exists by email
    boolean existsByUser_Email(String email);
}