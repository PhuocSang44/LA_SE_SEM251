package org.minhtrinh.hcmuttssbackend.dto;

public record UpdateClassRequest(
        String courseCode,
        String courseName,
        String semester,
        Integer capacity
) {}
