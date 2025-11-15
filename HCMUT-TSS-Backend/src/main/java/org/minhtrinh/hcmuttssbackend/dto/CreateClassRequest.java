package org.minhtrinh.hcmuttssbackend.dto;

public record CreateClassRequest(
        String courseCode,
        String courseName,
        String customClassName,
        String courseDescription,
        String semester,
        Integer capacity
) {}
