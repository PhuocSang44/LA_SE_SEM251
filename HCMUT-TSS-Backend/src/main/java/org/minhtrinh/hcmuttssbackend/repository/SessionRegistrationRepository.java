package org.minhtrinh.hcmuttssbackend.repository;
import java.util.List;

import org.minhtrinh.hcmuttssbackend.entity.SessionEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SessionRegistrationRepository extends JpaRepository<SessionEnrollment, Long> {
    boolean existsBySession_SessionIdAndStudent_StudentId(Long sessionId, Long studentId);
    List<SessionEnrollment> findByStudent_StudentId(Long studentId);
    List<SessionEnrollment> findBySession_SessionId(Long sessionId);
    long countBySession_SessionId(Long sessionId);
}
