package org.minhtrinh.hcmuttssbackend.dto;

public record  RescheduleRequest (
    Long sessionId,
    String newStartTime,
    String newEndTime,
    String newSessionTitle
) {}
