package org.minhtrinh.hcmuttssbackend.dto;

public record SessionRescheduleResponse(
    
    Long classId,
    String startTime,
    String endTime,
    String location,
    String sessionType,
    Integer capacity,
    String description
) {}
