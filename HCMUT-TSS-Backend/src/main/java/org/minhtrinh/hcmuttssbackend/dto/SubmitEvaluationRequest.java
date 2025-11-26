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
public class SubmitEvaluationRequest {

    private Long courseId;
    private Long classId;
    private String studentId;
    private String comment;
    private List<EvaluationCriterion> evaluationItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EvaluationCriterion {
        private String criterion;
        private Integer ratingValue;
        private Integer maxRating;
    }
}

