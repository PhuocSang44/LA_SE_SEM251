package org.minhtrinh.hcmuttssbackend.dto.forum;

import org.minhtrinh.hcmuttssbackend.entity.ForumType;

import java.time.LocalDateTime;

public record ForumResponse(
        Long forumId,
        String title,
        String description,
        ForumType forumType,
        String subject,
        Integer creatorUserId,
        String creatorName,
        String creatorRole,
        Long memberCount,
        Long postCount,
        Boolean isJoined,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
