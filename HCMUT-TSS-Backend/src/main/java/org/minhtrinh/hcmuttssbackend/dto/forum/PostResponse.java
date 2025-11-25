package org.minhtrinh.hcmuttssbackend.dto.forum;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long postId,
        Long forumId,
        String forumTitle,
        Integer authorUserId,
        String authorName,
        String authorRole,
        String title,
        String content,
        Integer views,
        Long voteScore,
        Long commentCount,
        Boolean hasAcceptedAnswer,
        List<String> tags,
        String userVote,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
