package org.minhtrinh.hcmuttssbackend.repository;

import java.util.List;
import java.util.Optional;

import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

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
    
    @Query("select c from Class c left join fetch c.tutor t left join fetch t.user u left join fetch t.department left join fetch c.course")
    List<Class> findAllWithTutorAndCourse();

    @Query("select c from Class c left join fetch c.tutor t left join fetch t.user u left join fetch t.department left join fetch c.course where c.course.courseId = :courseId")
    List<Class> findByCourse_CourseIdWithTutorAndCourse(@Param("courseId") Long courseId);

    @Query("select c from Class c left join fetch c.tutor t left join fetch t.user u left join fetch t.department left join fetch c.course where c.course.code = :courseCode")
    List<Class> findByCourse_CodeWithTutorAndCourse(@Param("courseCode") String courseCode);

    @Query("select c from Class c left join fetch c.tutor t left join fetch t.user u left join fetch t.department left join fetch c.course where c.tutor.staffId = :tutorId")
    List<Class> findByTutor_StaffIdWithTutorAndCourse(@Param("tutorId") String tutorId);

    @Query("select c from Class c left join fetch c.tutor t left join fetch t.user u left join fetch t.department left join fetch c.course where c.classId = :classId")
    Optional<Class> findByClassIdWithTutorAndCourse(@Param("classId") Long classId);

    @Modifying
    @Transactional
    @Query("update Class c set c.enrolledCount = c.enrolledCount + 1 where c.classId = :classId and (c.capacity is null or c.enrolledCount < c.capacity)")
    int incrementEnrolledIfSpace(@Param("classId") Long classId);

    @Modifying
    @Transactional
    @Query("update Class c set c.enrolledCount = c.enrolledCount - 1 where c.classId = :classId and c.enrolledCount > 0")
    int decrementEnrolledIfPositive(@Param("classId") Long classId);
}
