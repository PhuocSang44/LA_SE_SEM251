package org.minhtrinh.hcmuttssbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.minhtrinh.hcmuttssbackend.entity.PerformanceEvaluationStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceEvaluationResponse {

    private Long evaluationId;
    private String clientRequestId;
    private String studentId;
    private String studentName;
    private Long classId;
    private String className;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String tutorName;
    private Double overallScore;
    private String overallComment;
    private Integer starRating;
    private Double numericScore;
    private PerformanceEvaluationStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private List<MetricResponse> metrics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricResponse {
        private Long metricId;
        private String question;
        private Double score;
        private Double maxScore;
        private String comment;
    }
}
