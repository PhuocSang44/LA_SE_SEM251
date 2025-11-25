package org.minhtrinh.hcmuttssbackend.dto.forum;

import java.util.List;

public record CreatePostRequest(
        Long forumId,
        String title,
        String content,
        List<String> tags
) {}
