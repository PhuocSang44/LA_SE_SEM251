//Vuong
package org.minhtrinh.hcmuttssbackend.dto;

import java.time.Instant;

public record CourseRegistrationResponse(
        Long registrationId,
        Long classId,
        String courseCode,
        String courseName,
        String semester,
        Long tutorId,
        String tutorName,
        Long studentId,
        String classStatus,
        Instant registeredAt
) {}
