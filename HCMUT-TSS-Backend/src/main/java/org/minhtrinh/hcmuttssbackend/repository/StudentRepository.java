package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByUser_UserId(Integer userId);
    Optional<Student> findByStudentId(String studentId);
    List<Student> findByDepartment_DepartmentName(String departmentName);
    List<Student> findByMajor(String major);
    List<Student> findByAcademicLevel(String academicLevel);
}
