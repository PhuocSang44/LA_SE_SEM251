package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.PerformanceEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PerformanceEvaluationRepository extends JpaRepository<PerformanceEvaluation, Long> {

    Optional<PerformanceEvaluation> findByClassEntity_ClassIdAndStudent_StudentId(Long classId, String studentId);

    List<PerformanceEvaluation> findByClassEntity_ClassId(Long classId);

    List<PerformanceEvaluation> findByStudent_UserId(Integer userId);

    Optional<PerformanceEvaluation> findByClientRequestId(String clientRequestId);
}
