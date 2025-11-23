package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByStudent_StudentId(String studentId);

    List<Feedback> findByCourse_CourseId(Long courseId);

    List<Feedback> findByClassEntity_ClassId(Long classId);

    List<Feedback> findByStatus(String status);

    boolean existsByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId);
}

