package org.minhtrinh.hcmuttssbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.minhtrinh.hcmuttssbackend.entity.FeedbackStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {

    private Long feedbackId;
    private String clientRequestId;
    private String studentId;
    private String studentName;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long classId;
    private String className;
    private String tutorName;
    private String comment;
    private String imageUrl;
    private FeedbackStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime moderatedAt;
    private List<RatingResponse> ratings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RatingResponse {
        private Long ratingId;
        private String question;
        private Integer ratingValue;
    }
}

