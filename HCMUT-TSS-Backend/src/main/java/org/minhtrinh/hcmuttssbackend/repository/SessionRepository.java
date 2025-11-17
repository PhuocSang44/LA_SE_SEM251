package org.minhtrinh.hcmuttssbackend.repository;
import java.util.List;

import org.minhtrinh.hcmuttssbackend.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByClazz_Tutor_OfficialId(Long tutorId);
}
