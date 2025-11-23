package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Feedback;
import org.minhtrinh.hcmuttssbackend.entity.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByStudent_StudentIdOrderByCreatedAtDesc(String studentId);

    List<Feedback> findByStudent_UserId(Integer userId);

    List<Feedback> findByCourse_CourseId(Long courseId);

    List<Feedback> findByClassEntity_ClassId(Long classId);

    List<Feedback> findByClassEntity_ClassIdAndStatus(Long classId, FeedbackStatus status);

    List<Feedback> findByStatus(FeedbackStatus status);

    boolean existsByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId);

    boolean existsByStudent_UserIdAndClassEntity_ClassId(Integer userId, Long classId);

    Optional<Feedback> findByClientRequestId(String clientRequestId);

    List<Feedback> findByCreatedAtAfter(LocalDateTime threshold);
}

