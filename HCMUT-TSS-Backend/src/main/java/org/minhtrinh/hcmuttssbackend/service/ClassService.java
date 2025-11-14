package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.dto.ClassResponse;
import org.minhtrinh.hcmuttssbackend.dto.CreateClassRequest;
import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.entity.UniversityStaff;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.repository.ClassRepository;
import org.minhtrinh.hcmuttssbackend.repository.CourseRepository;
import org.minhtrinh.hcmuttssbackend.repository.UniversityStaffRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.minhtrinh.hcmuttssbackend.dto.UpdateClassRequest;

@Service
public class ClassService {

    private final ClassRepository classRepository;
    private final CourseRepository courseRepository;
    private final UniversityStaffRepository staffRepository;
    private final UserRepository userRepository;

    public ClassService(ClassRepository classRepository,
                        CourseRepository courseRepository,
                        UniversityStaffRepository staffRepository,
                        UserRepository userRepository) {
        this.classRepository = classRepository;
        this.courseRepository = courseRepository;
        this.staffRepository = staffRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ClassResponse createClass(CreateClassRequest request, Integer userId) {
        // Find or create course
                // Race-safe course lookup/creation
                String code = request.courseCode();
                Optional<Course> existing = courseRepository.findByCode(code);
                Course course = existing.orElseGet(() -> {
                        Course newCourse = Course.builder()
                                        .code(request.courseCode())
                                        .name(request.courseName())
                                        .description(request.courseDescription())
                                        .build();
                        try {
                                return courseRepository.save(newCourse);
                        } catch (DataIntegrityViolationException ex) {
                                // Another inserted the same course.
                                return courseRepository.findByCode(code)
                                                .orElseThrow(() -> new RuntimeException("Failed to create or find course: " + code, ex));
                        }
                });

        // Find tutor by userId
        UniversityStaff tutor = staffRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tutor not found for userId: " + userId));

        // Create new class
        Class newClass = Class.builder()
                .course(course)
                .tutor(tutor)
                .semester(request.semester())
                .capacity(request.capacity())
                .createdAt(LocalDateTime.now())
                .status("ACTIVE")
                .build();

        Class savedClass = classRepository.save(newClass);

        return mapToResponse(savedClass);
    }

    public List<ClassResponse> getAllClasses(Integer requesterUserId) {
        return classRepository.findAll().stream()
                .filter(c -> !isCreatedByRequester(c, requesterUserId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ClassResponse> getClassesByCourse(String courseCode, Integer requesterUserId) {
        Course course = courseRepository.findByCode(courseCode)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseCode));
        return classRepository.findByCourse_CourseId(course.getCourseId()).stream()
                .filter(c -> !isCreatedByRequester(c, requesterUserId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean isCreatedByRequester(Class c, Integer requesterUserId) {
        if (requesterUserId == null) return false;
        if (c.getTutor() == null) return false;
        Integer tutorUserId = c.getTutor().getUserId();
        return tutorUserId != null && tutorUserId.equals(requesterUserId);
    }

    public List<ClassResponse> getClassesByTutor(Integer userId) {
        UniversityStaff tutor = staffRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        return classRepository.findByTutor_StaffId(tutor.getStaffId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

        @Transactional
        public void deleteClass(Long classId, Integer userId) {
                Class classEntity = classRepository.findById(classId)
                                .orElseThrow(() -> new RuntimeException("Class not found"));
                if (classEntity.getTutor() == null || !classEntity.getTutor().getUserId().equals(userId)) {
                        throw new RuntimeException("Not authorized to delete this class");
                }
                classRepository.delete(classEntity);
        }

        @Transactional
        public ClassResponse updateClass(Long classId, UpdateClassRequest req, Integer userId) {
                Class classEntity = classRepository.findById(classId)
                                .orElseThrow(() -> new RuntimeException("Class not found"));
                if (classEntity.getTutor() == null || !classEntity.getTutor().getUserId().equals(userId)) {
                        throw new RuntimeException("Not authorized to update this class");
                }

                // update semester/capacity
                if (req.semester() != null) classEntity.setSemester(req.semester());
                if (req.capacity() != null) classEntity.setCapacity(req.capacity());

                // if course code/name provided, try to find or create course and set it on the class
                if (req.courseCode() != null && !req.courseCode().isBlank()) {
                        String code = req.courseCode();
                        Optional<Course> existing = courseRepository.findByCode(code);
                        Course course = existing.orElseGet(() -> {
                                Course newCourse = Course.builder()
                                                .code(code)
                                                .name(req.courseName() == null ? "" : req.courseName())
                                                .description("")
                                                .build();
                                try {
                                        return courseRepository.save(newCourse);
                                } catch (DataIntegrityViolationException ex) {
                                        return courseRepository.findByCode(code)
                                                        .orElseThrow(() -> new RuntimeException("Failed to create or find course: " + code, ex));
                                }
                        });
                        classEntity.setCourse(course);
                }

                // allow renaming the existing course (if only courseName provided)
                if ((req.courseCode() == null || req.courseCode().isBlank()) && req.courseName() != null) {
                        Course current = classEntity.getCourse();
                        if (current != null) {
                                current.setName(req.courseName());
                                courseRepository.save(current);
                        }
                }

                Class saved = classRepository.save(classEntity);
                return mapToResponse(saved);
        }

    private ClassResponse mapToResponse(Class classEntity) {
        UniversityStaff tutor = classEntity.getTutor();
        User tutorUser = null;
        if (tutor != null) {
            tutorUser = userRepository.findById(tutor.getUserId()).orElse(null);
        }
        String tutorName = tutorUser == null ? null :
                ((tutorUser.getFirstName() == null ? "" : tutorUser.getFirstName()) + " " +
                        (tutorUser.getLastName() == null ? "" : tutorUser.getLastName())).trim();

        return new ClassResponse(
                classEntity.getClassId(),
                classEntity.getCourse().getCode(),
                classEntity.getCourse().getName(),
                classEntity.getSemester(),
                tutorName,
                tutor == null ? null : tutor.getOfficialId(),
                classEntity.getStatus(),
                classEntity.getCapacity(),
                classEntity.getEnrolledCount()
        );
    }
}
