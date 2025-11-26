package org.minhtrinh.hcmuttssbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrolledStudentResponse {

    private String studentId;
    private String studentName;
    private String email;
    private String major;
    private String academicLevel;
    private Long registrationId;
}

