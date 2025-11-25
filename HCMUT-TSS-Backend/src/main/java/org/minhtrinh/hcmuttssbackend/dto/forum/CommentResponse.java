package org.minhtrinh.hcmuttssbackend.dto.forum;

import java.time.LocalDateTime;

public record CommentResponse(
        Long commentId,
        Long postId,
        Integer authorUserId,
        String authorName,
        String authorRole,
        String content,
        Long voteScore,
        Boolean isAccepted,
        String userVote,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
