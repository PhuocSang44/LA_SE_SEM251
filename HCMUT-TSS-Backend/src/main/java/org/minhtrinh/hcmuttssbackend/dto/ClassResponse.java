package org.minhtrinh.hcmuttssbackend.dto;

public record ClassResponse(
        Long classId,
        String courseCode,
        String courseName,
        String customClassName,
        String description,
        String semester,
        String tutorName,
        String tutorId,
        String tutorDepartment,
        String tutorSpecialization,
        String status,
        Integer capacity,
        Integer enrolledCount
) {}
