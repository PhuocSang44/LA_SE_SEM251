package org.minhtrinh.hcmuttssbackend.mapper;

import org.minhtrinh.hcmuttssbackend.dto.CourseRegistrationResponse;
import org.minhtrinh.hcmuttssbackend.dto.EnrollmentResponse;
import org.minhtrinh.hcmuttssbackend.entity.CourseRegistration;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class CourseRegistrationMapper {

    private final UserRepository userRepository;

    public CourseRegistrationMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public CourseRegistrationResponse toResponse(CourseRegistration cr) {
        var clazz = cr.getClassEntity();
        var course = clazz.getCourse();
        var tutor = clazz.getTutor();

        String tutorName = null;
        if (tutor != null && tutor.getUserId() != null) {
            tutorName = userRepository.findById(tutor.getUserId())
                    .map(this::buildFullName)
                    .orElse(null);
        }

        String responseCourseName = (clazz.getCustomName() != null && !clazz.getCustomName().isBlank())
                ? clazz.getCustomName()
                : (course == null ? null : course.getName());

        return new CourseRegistrationResponse(
                cr.getRegistrationId(),
                clazz.getClassId(),
                course == null ? null : course.getCode(),
                responseCourseName,
                clazz.getSemester(),
                tutor == null ? null : tutor.getStaffId(),
                tutorName,
                cr.getStudent().getStudentId(),
                clazz.getStatus(),
                cr.getRegisteredAt()
        );
    }

    public EnrollmentResponse toEnrollmentResponse(CourseRegistration cr) {
        var clazz = cr.getClassEntity();
        var course = clazz.getCourse();
        var tutor = clazz.getTutor();

        String tutorName = null;
        if (tutor != null && tutor.getUserId() != null) {
            tutorName = userRepository.findById(tutor.getUserId())
                    .map(this::buildFullName)
                    .orElse(null);
        }

        String responseCourseName = (clazz.getCustomName() != null && !clazz.getCustomName().isBlank())
                ? clazz.getCustomName()
                : (course == null ? null : course.getName());

        return new EnrollmentResponse(
                cr.getRegistrationId(),
                clazz.getClassId(),
                course == null ? null : course.getCode(),
                responseCourseName,
                clazz.getSemester(),
                tutor == null ? null : tutor.getStaffId(),
                tutorName,
                clazz.getStatus(),
                cr.getRegisteredAt()
        );
    }

    private String buildFullName(User u) {
        String first = u.getFirstName() == null ? "" : u.getFirstName();
        String last = u.getLastName() == null ? "" : u.getLastName();
        return (first + " " + last).trim();
    }
}
