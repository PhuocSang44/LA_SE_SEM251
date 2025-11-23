package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.SessionEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRegistrationRepository extends JpaRepository<SessionEnrollment, Long> {

    List<SessionEnrollment> findBySession_SessionId(Long sessionId);

    long countBySession_SessionId(Long sessionId);

    boolean existsBySession_SessionIdAndStudent_UserId(Long sessionId, Integer userId);

    List<SessionEnrollment> findByStudent_UserId(Integer userId);

    List<SessionEnrollment> findByStudent_UserIdAndSession_Clazz_ClassId(Integer userId, Long classId);

    boolean existsByStudent_UserIdAndSession_Clazz_ClassId(Integer userId, Long classId);

    long countByStudent_UserIdAndSession_Clazz_ClassIdAndSession_Status(Integer userId, Long classId, String status);
}
