package org.minhtrinh.hcmuttssbackend.repository;
import java.util.List;

import org.minhtrinh.hcmuttssbackend.entity.SessionEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRegistrationRepository extends JpaRepository<SessionEnrollment, Long> {
    List<SessionEnrollment> findBySession_SessionId(Long sessionId);
    long countBySession_SessionId(Long sessionId);
    
    // Methods for main schema (using user_id)
    boolean existsBySession_SessionIdAndStudent_UserId(Long sessionId, Integer userId);
    List<SessionEnrollment> findByStudent_UserId(Integer userId);
}
