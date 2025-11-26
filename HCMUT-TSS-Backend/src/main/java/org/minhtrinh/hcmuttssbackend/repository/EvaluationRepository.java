package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByStudent_StudentId(String studentId);

    List<Evaluation> findByCourse_CourseId(Long courseId);

    List<Evaluation> findByClassEntity_ClassId(Long classId);

    List<Evaluation> findByTutor_StaffId(String tutorId);

    Optional<Evaluation> findByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId);

    boolean existsByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId);
}

