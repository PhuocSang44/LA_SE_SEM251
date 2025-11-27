package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Feedback;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    @EntityGraph(attributePaths = {"student.user", "course", "classEntity", "ratings"})
    List<Feedback> findByStudent_StudentId(String studentId);

    @EntityGraph(attributePaths = {"student.user", "course", "classEntity", "ratings"})
    List<Feedback> findByCourse_CourseId(Long courseId);

    @EntityGraph(attributePaths = {"student.user", "course", "classEntity", "ratings"})
    List<Feedback> findByClassEntity_ClassId(Long classId);

    @EntityGraph(attributePaths = {"student.user", "course", "classEntity", "ratings"})
    List<Feedback> findByStatus(String status);

    boolean existsByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId);
}

