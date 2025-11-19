package org.minhtrinh.hcmuttssbackend.dto;

public record ClassResponse(
        Long classId,
        String courseCode,
        String courseName,
        String semester,
        String tutorName,
        String tutorId,
        String tutorDepartment,
        String tutorSpecialization,
        String status,
        Integer capacity,
        Integer enrolledCount
) {}
