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
public class EvaluationResponse {

    private Long evaluationId;
    private String studentId;
    private String studentName;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long classId;
    private String tutorId;
    private String tutorName;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<EvaluationItemResponse> evaluationItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EvaluationItemResponse {
        private Long itemId;
        private String criterion;
        private Integer ratingValue;
        private Integer maxRating;
    }
}

