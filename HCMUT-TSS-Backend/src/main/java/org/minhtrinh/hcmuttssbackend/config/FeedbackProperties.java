package org.minhtrinh.hcmuttssbackend.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;

/**
 * Typed configuration for feedback-related constraints and feature flags. Centralising these
 * knobs keeps the validation logic inside {@code FeedbackService} small and testable.
 */
@Validated
@ConfigurationProperties(prefix = "feedback")
public class FeedbackProperties {

    /**
     * Idempotency window. Requests that reuse the same client request id are treated as retries
     * while the id remains in this time window.
     */
    @NotNull
    private Duration idempotencyTtl = Duration.ofMinutes(10);

    /**
     * Whether students must have at least one completed session in the class before submitting
     * feedback.
     */
    private boolean requireCompletedSession = true;

    /**
     * Session status that qualifies as completed. Matches {@link org.minhtrinh.hcmuttssbackend.entity.Session#getStatus()}.
     */
    @NotEmpty
    private String completedSessionStatus = "COMPLETED";

    /**
     * Maximum supported image payload size (approximated, in megabytes) for single attachment URLs.
     */
    @Min(1)
    @Max(50)
    private long maxImageSizeMb = 5;

    /**
     * Allowed image extensions (lowercase, without dot) used by {@code MediaValidationService}.
     */
    @NotEmpty
    private List<String> allowedImageExtensions = List.of("jpg", "jpeg", "png", "gif", "webp");

    public Duration getIdempotencyTtl() {
        return idempotencyTtl;
    }

    public void setIdempotencyTtl(Duration idempotencyTtl) {
        this.idempotencyTtl = idempotencyTtl;
    }

    public boolean isRequireCompletedSession() {
        return requireCompletedSession;
    }

    public void setRequireCompletedSession(boolean requireCompletedSession) {
        this.requireCompletedSession = requireCompletedSession;
    }

    public String getCompletedSessionStatus() {
        return completedSessionStatus;
    }

    public void setCompletedSessionStatus(String completedSessionStatus) {
        this.completedSessionStatus = completedSessionStatus;
    }

    public long getMaxImageSizeMb() {
        return maxImageSizeMb;
    }

    public void setMaxImageSizeMb(long maxImageSizeMb) {
        this.maxImageSizeMb = maxImageSizeMb;
    }

    public List<String> getAllowedImageExtensions() {
        return allowedImageExtensions;
    }

    public void setAllowedImageExtensions(List<String> allowedImageExtensions) {
        this.allowedImageExtensions = allowedImageExtensions;
    }
}
