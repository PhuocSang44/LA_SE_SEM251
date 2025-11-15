package org.minhtrinh.hcmuttssbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrolledCourseResponse {

    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long classId;
    private String className;
    private String semester;
    private String tutorName;
    private String status;
}

