// Vuong
package org.minhtrinh.hcmuttssbackend.dto;

public record CreateCourseRequest(
        String code,
        String name,
        String description,
        String departmentName
) {}
