package org.minhtrinh.hcmuttssbackend.dto;

public record ClassResponse(
        Long classId,
        String courseCode,
        String courseName,
        String semester,
        String tutorName,
        Long tutorId,
        String status,
        Integer capacity,
        Integer enrolledCount
) {}
