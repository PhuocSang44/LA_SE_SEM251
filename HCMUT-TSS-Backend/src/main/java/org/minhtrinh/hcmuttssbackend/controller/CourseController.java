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

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<CourseResponse> create(@RequestBody CreateCourseRequest req) {
        Course c = courseService.createCourse(req);
        return ResponseEntity.ok(new CourseResponse(c.getCourseId(), c.getCode(), c.getName(), c.getDescription(), c.getDepartmentName()));
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses(@RequestParam(required = false) String q) {
        java.util.List<Course> found = courseService.listCourses(q);
        List<CourseResponse> courses = found.stream()
                .map(c -> new CourseResponse(c.getCourseId(), c.getCode(), c.getName(), c.getDescription(), c.getDepartmentName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{code}")
    public ResponseEntity<CourseResponse> byCode(@PathVariable String code) {
        Course c = courseService.findByCodeOrThrow(code);
        return ResponseEntity.ok(new CourseResponse(c.getCourseId(), c.getCode(), c.getName(), c.getDescription(), c.getDepartmentName()));
    }
}
