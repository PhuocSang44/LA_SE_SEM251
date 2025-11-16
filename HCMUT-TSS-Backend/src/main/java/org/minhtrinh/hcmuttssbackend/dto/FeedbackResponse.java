package org.minhtrinh.hcmuttssbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {

    private Long feedbackId;
    private String studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
    private Long classId;
    private String comment;
    private String imageUrl;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
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

