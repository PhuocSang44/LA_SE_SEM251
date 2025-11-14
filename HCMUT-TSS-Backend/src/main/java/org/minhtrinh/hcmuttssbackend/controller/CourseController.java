//vuong
package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.dto.CreateCourseRequest;
import org.minhtrinh.hcmuttssbackend.dto.CourseResponse;
import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.repository.CourseRepository;
import org.minhtrinh.hcmuttssbackend.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/courses", "/api/courses"})
public class CourseController {

    private final CourseService courseService;
    private final CourseRepository courseRepository;

    public CourseController(CourseService courseService, CourseRepository courseRepository) {
        this.courseService = courseService;
        this.courseRepository = courseRepository;
    }

    @PostMapping
    public ResponseEntity<CourseResponse> create(@RequestBody CreateCourseRequest req) {
        Course c = courseService.createCourse(req);
        return ResponseEntity.ok(new CourseResponse(c.getCourseId(), c.getCode(), c.getName(), c.getDescription(), c.getDepartmentName()));
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses(@RequestParam(required = false) String q) {
        List<Course> found;
        if (q == null || q.isBlank()) {
            found = courseRepository.findAll();
        } else {
            // Search both by code and name using same query string `q`
            found = courseRepository.findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(q, q);
        }

        List<CourseResponse> courses = found.stream()
                .map(c -> new CourseResponse(c.getCourseId(), c.getCode(), c.getName(), c.getDescription(), c.getDepartmentName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{code}")
    public ResponseEntity<CourseResponse> byCode(@PathVariable String code) {
        Course c = courseRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + code));
        return ResponseEntity.ok(new CourseResponse(c.getCourseId(), c.getCode(), c.getName(), c.getDescription(), c.getDepartmentName()));
    }
}
