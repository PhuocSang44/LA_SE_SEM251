package org.minhtrinh.hcmuttssbackend.dto.forum;

public record CreateCommentRequest(
        Long postId,
        String content
) {}
