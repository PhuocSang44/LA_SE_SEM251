package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {


    @EntityGraph(attributePaths = {"student.user", "tutor.user"})
    List<Evaluation> findByStudent_StudentId(String studentId);

    @EntityGraph(attributePaths = {"student.user", "tutor.user"})
    List<Evaluation> findByCourse_CourseId(Long courseId);

    @EntityGraph(attributePaths = {"student.user", "tutor.user"})
    List<Evaluation> findByClassEntity_ClassId(Long classId);

    @EntityGraph(attributePaths = {"student.user", "tutor.user"})
    List<Evaluation> findByTutor_StaffId(String tutorId);

    @EntityGraph(attributePaths = {"student.user", "tutor.user"})
    Optional<Evaluation> findByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId);

    boolean existsByStudent_StudentIdAndClassEntity_ClassId(String studentId, Long classId);
}

