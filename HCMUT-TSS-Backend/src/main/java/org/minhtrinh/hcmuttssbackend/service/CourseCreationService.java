package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.entity.Department;
import org.minhtrinh.hcmuttssbackend.repository.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseCreationService {

    private static final Logger log = LoggerFactory.getLogger(CourseCreationService.class);

    private final CourseRepository courseRepository;

    public CourseCreationService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Course createIfNotExists(String code, String name, Department dept, String deptName) {
        var existing = courseRepository.findByCode(code);
        if (existing.isPresent()) return existing.get();

        Course newCourse = Course.builder()
                .code(code)
                .name(name == null ? "" : name)
                .description("")
                .department(dept)
                .departmentName(deptName)
                .build();
        try {
            return courseRepository.save(newCourse);
        } catch (DataIntegrityViolationException ex) {
            // another tx created it concurrently -> re-query and return
            log.warn("Concurrent create detected for course {}: {}, refetching", code, ex.getMessage());
            return courseRepository.findByCode(code)
                    .orElseThrow(() -> new RuntimeException("Failed to create or find course: " + code, ex));
        }
    }
}
