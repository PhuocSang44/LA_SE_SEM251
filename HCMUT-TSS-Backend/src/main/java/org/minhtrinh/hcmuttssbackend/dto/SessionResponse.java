package org.minhtrinh.hcmuttssbackend.dto;

public record SessionResponse (
    Long sessionId,
    Long classId,
    String sessionTitle,
    String startTime,
    String endTime,
    String location,
    String sessionType,
    Integer capacity,
    String description
)
{}
