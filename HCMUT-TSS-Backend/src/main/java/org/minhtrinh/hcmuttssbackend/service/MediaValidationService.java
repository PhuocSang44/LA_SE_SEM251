package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.config.FeedbackProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class MediaValidationService {

    private final FeedbackProperties feedbackProperties;

    public MediaValidationService(FeedbackProperties feedbackProperties) {
        this.feedbackProperties = feedbackProperties;
    }

    public void validateImageUrl(String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            return;
        }

        String normalized = imageUrl.trim().toLowerCase();
        int lastDot = normalized.lastIndexOf('.');
        if (lastDot == -1) {
            throw new IllegalArgumentException("Attachment must include a file extension");
        }

        String extension = normalized.substring(lastDot + 1);
        if (!feedbackProperties.getAllowedImageExtensions().contains(extension)) {
            throw new IllegalArgumentException("Unsupported image extension: " + extension);
        }
    }
}
