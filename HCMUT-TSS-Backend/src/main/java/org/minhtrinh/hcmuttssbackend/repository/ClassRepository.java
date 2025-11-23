package org.minhtrinh.hcmuttssbackend.repository;

import java.util.List;
import java.util.Optional;

import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassRepository extends JpaRepository<Class, Long> {
    List<Class> findByCourse_CourseId(Long courseId);
    List<Class> findByTutor_StaffId(String tutorId);
    List<Class> findBySemester(String semester);
    List<Class> findByCourse_Code(String courseCode);
    Optional<Class> findByCourse_CodeAndTutor_StaffId(String courseCode, String tutorId);
    Optional<Class> findByClassIdAndTutor_StaffId(Long classId, String tutorId);
    // convenience lookups by tutor official id (frontend uses tutor.officialId)
    //List<Class> findByTutor_OfficialId(String officialId);
    //Optional<Class> findByCourse_CodeAndTutor_OfficialId(String courseCode, String officialId);
    Optional<Class> findByClassId(Long classId);
}
