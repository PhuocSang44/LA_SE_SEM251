//vuong
package org.minhtrinh.hcmuttssbackend.dto;

//when omitted -> backend uses the authenticated user ( Extraa )
public record RegisterCourseRequest(
        Long classId,
        String studentId,
        String studentEmail
) {}
