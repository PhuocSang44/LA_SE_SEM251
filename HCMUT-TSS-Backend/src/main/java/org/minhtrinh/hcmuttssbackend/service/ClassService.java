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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ClassService {

    // Thêm Logger để debug
    private static final Logger log = LoggerFactory.getLogger(ClassService.class);

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
        log.info("Bắt đầu update classId: {} cho userId: {}", classId, userId);
        
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        if (classEntity.getTutor() == null || !classEntity.getTutor().getUserId().equals(userId)) {
            log.warn("Authorization FAILED cho userId: {} khi update classId: {}", userId, classId);
            throw new RuntimeException("Not authorized to update this class");
        }

        // update semester/capacity
        if (req.getSemester() != null) classEntity.setSemester(req.getSemester());
        if (req.getCapacity() != null) classEntity.setCapacity(req.getCapacity());
        
        Course courseToSet = null;

        // Kịch bản 1: User cung cấp Course Code (muốn đổi/tạo course mới)
        if (req.getCourseCode() != null && !req.getCourseCode().isBlank()) {
            String code = req.getCourseCode();
            String name = (req.getCourseName() == null || req.getCourseName().isBlank())
                    ? "" // Cần 1 tên default nếu tạo mới
                    : req.getCourseName();

            log.info("Kịch bản 1: Tìm/tạo course với code {} và tên {}", code, name);

            Optional<Course> existing = courseRepository.findByCode(code);
            
            if (existing.isPresent()) {
                courseToSet = existing.get();
                // Nếu user CŨNG cung cấp tên MỚI -> update tên của course đó
                if (!name.isEmpty() && !name.equals(courseToSet.getName())) {
                    log.info("Updating name cho course đã có {}: {}", code, name);
                    courseToSet.setName(name);
                    courseToSet = courseRepository.save(courseToSet);
                }
            } else {
                // Course code không tồn tại -> Tạo mới
                log.info("Tạo course mới với code {} và tên {}", code, name);
                Course newCourse = Course.builder()
                        .code(code)
                        .name(name)
                        .description("") // Có thể copy description cũ nếu muốn
                        .build();
                courseToSet = courseRepository.save(newCourse); 
            }
            classEntity.setCourse(courseToSet);
        
        // Kịch bản 2: User KHÔNG cung cấp code, chỉ cung cấp tên (muốn đổi tên cho riêng class này)
        } else if (req.getCourseName() != null && !req.getCourseName().isBlank()) {
            log.info("Kịch bản 2: Chỉ đổi tên -> sử dụng customName: {}", req.getCourseName());
            // Chỉ set customName trên Class; không tạo Course mới
            classEntity.setCustomName(req.getCourseName());
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

        Long tutorOfficialId = null;
        if (tutor != null) {
            tutorOfficialId = tutor.getOfficialId();
        }

        // Prepare course fields for response. Prefer class.customName if present.
        Course course = classEntity.getCourse();
        String responseCourseCode = null;
        String responseCourseName = null;
        if (course != null) {
            responseCourseCode = course.getCode();
            responseCourseName = (classEntity.getCustomName() != null && !classEntity.getCustomName().isBlank())
                    ? classEntity.getCustomName()
                    : course.getName();
        } else {
            responseCourseName = classEntity.getCustomName();
        }

        return new ClassResponse(
                classEntity.getClassId(),
                responseCourseCode,
                responseCourseName,
                classEntity.getSemester(),
                tutorName,
                tutorOfficialId,
                classEntity.getStatus(),
                classEntity.getCapacity(),
                classEntity.getEnrolledCount()
        );
    }
}
