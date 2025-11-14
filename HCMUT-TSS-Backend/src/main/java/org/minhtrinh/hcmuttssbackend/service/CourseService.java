//Vuong
package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.dto.CreateCourseRequest;
import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Transactional
    public Course createCourse(CreateCourseRequest req) {
        courseRepository.findByCode(req.code()).ifPresent(c -> {
            throw new IllegalArgumentException("Course code already exists: " + req.code());
        });

        Course course = Course.builder()
                .code(req.code()).name(req.name())
                .description(req.description())
                .departmentName(req.departmentName())
                .build();

        return courseRepository.save(course);
    }
}
