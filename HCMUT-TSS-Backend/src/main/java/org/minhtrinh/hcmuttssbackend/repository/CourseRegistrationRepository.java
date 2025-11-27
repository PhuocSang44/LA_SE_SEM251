//Vuong
package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.CourseRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface CourseRegistrationRepository extends JpaRepository<CourseRegistration, Long> {
    Optional<CourseRegistration> findByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId);
    @EntityGraph(attributePaths = {"classEntity", "classEntity.tutor", "classEntity.tutor.user", "classEntity.course", "student.user"})
    List<CourseRegistration> findByStudent_StudentId(String studentId);
    @EntityGraph(attributePaths = {"student.user"})
    List<CourseRegistration> findByClassEntity_ClassId(Long classId);
    
    @org.springframework.data.jpa.repository.Query("SELECT cr FROM CourseRegistration cr JOIN FETCH cr.student s JOIN FETCH s.user u WHERE cr.classEntity.classId = :classId")
    List<CourseRegistration> findByClassEntity_ClassIdWithStudentUser(@org.springframework.data.repository.query.Param("classId") Long classId);
    long countByClassEntity_ClassId(Long classId);
    // Find registration by student and course (used to enforce unique student-course constraint)
    Optional<CourseRegistration> findByStudent_StudentIdAndCourse_CourseId(String studentId, Long courseId);
    // Check if student is enrolled in a class
    boolean existsByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId);
}
