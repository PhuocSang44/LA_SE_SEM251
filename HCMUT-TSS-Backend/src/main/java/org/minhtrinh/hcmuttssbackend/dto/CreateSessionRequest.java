package org.minhtrinh.hcmuttssbackend.dto;

public record CreateSessionRequest(
    String classId,
    String title,
    String startTime,
    String endTime,
    String location,
    String sessionType,
    Integer capacity,
    String description
){}
