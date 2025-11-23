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
}
