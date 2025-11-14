//Vuong
package org.minhtrinh.hcmuttssbackend.dto;

public record CourseResponse(
        Long courseId,
        String code,
        String name,
        String description,
        String departmentName
) {}
