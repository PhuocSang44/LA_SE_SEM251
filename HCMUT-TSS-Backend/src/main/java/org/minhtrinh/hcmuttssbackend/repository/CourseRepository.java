//Vuong
package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCode(String code);
    // Derived query (long name) - searches code OR name containing the given q, case-insensitive
    List<Course> findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(String codePart, String namePart);
}
