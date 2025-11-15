//Vuong
package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.CourseRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRegistrationRepository extends JpaRepository<CourseRegistration, Long> {
    Optional<CourseRegistration> findByStudent_StudentIdAndClassEntity_ClassId(Long studentId, Long classId);
    List<CourseRegistration> findByStudent_StudentId(Long studentId);
    long countByClassEntity_ClassId(Long classId);
    // Find registration by student and course (used to enforce unique student-course constraint)
    Optional<CourseRegistration> findByStudent_StudentIdAndCourse_CourseId(Long studentId, Long courseId);
    // Check if student is enrolled in a class
    boolean existsByStudent_StudentIdAndClassEntity_ClassId(Long studentId, Long classId);
}
