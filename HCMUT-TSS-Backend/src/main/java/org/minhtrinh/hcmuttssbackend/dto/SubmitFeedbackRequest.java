package org.minhtrinh.hcmuttssbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitFeedbackRequest {

    private Long courseId;
    private Long classId;
    private String comment;
    private String imageUrl;
    private List<RatingQuestion> ratings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RatingQuestion {
        private String question;
        private Integer ratingValue; // 1-5 stars
    }
}

