package org.minhtrinh.hcmuttssbackend.repository;

import java.util.List;
import org.minhtrinh.hcmuttssbackend.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByCourse_CourseIdOrderByCreatedAtDesc(Long courseId);
}

