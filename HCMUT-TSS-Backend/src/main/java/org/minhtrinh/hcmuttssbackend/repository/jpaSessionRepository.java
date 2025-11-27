package org.minhtrinh.hcmuttssbackend.repository;
import java.util.List;

import org.minhtrinh.hcmuttssbackend.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Rename bean to avoid collision with Spring Session's RedisHttpSessionConfiguration#sessionRepository
@Repository("jpaSessionRepository")
public interface jpaSessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByClazz_Tutor_StaffId(String staffId);
    List<Session> findByClazz_ClassId(Long classId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Session s SET s.currentStudents = s.currentStudents + 1 WHERE s.sessionId = :id AND (s.maxStudents IS NULL OR s.currentStudents < s.maxStudents)")
    int incrementCurrentStudentsIfSpace(@org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Session s SET s.currentStudents = s.currentStudents - 1 WHERE s.sessionId = :id AND s.currentStudents > 0")
    int decrementCurrentStudentsIfPositive(@org.springframework.data.repository.query.Param("id") Long id);
}
