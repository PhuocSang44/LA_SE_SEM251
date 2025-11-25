package org.minhtrinh.hcmuttssbackend.dto.forum;

import org.minhtrinh.hcmuttssbackend.entity.ForumType;

public record CreateForumRequest(
        String title,
        String description,
        ForumType forumType,
        String subject
) {}
