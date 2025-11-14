package org.minhtrinh.hcmuttssbackend.dto;

public record EnrollmentRequest(
        Long classId,
        String courseCode,
        Long tutorId  
) {}
