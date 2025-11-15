package org.minhtrinh.hcmuttssbackend.dto;

import java.time.Instant;

public record EnrollmentResponse(
        Long registrationId,
        Long classId,
        String courseCode,
        String courseName,
        String semester,
        Long tutorId,
        String tutorName,
        String status,
        Instant enrolledAt
) {}
