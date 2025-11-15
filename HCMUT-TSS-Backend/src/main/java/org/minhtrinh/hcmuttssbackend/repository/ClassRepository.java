package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassRepository extends JpaRepository<Class, Long> {
    List<Class> findByCourse_CourseId(Long courseId);
    List<Class> findByTutor_StaffId(Long tutorId);
    List<Class> findBySemester(String semester);
    List<Class> findByCourse_Code(String courseCode);
    Optional<Class> findByCourse_CodeAndTutor_StaffId(String courseCode, Long tutorId);
    // convenience lookups by tutor official id (frontend uses tutor.officialId)
    List<Class> findByTutor_OfficialId(Long officialId);
    Optional<Class> findByCourse_CodeAndTutor_OfficialId(String courseCode, Long officialId);
}
