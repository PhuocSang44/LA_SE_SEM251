package org.minhtrinh.hcmuttssbackend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluatePerformanceRequest {

    @NotBlank
    @Size(max = 100)
    private String clientRequestId;

    @NotNull
    private Long classId;

    @NotBlank
    @Size(max = 50)
    private String studentId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer starRating;

    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double numericScore;

    @Size(max = 4000)
    private String overallComment;

    @NotEmpty
    @Valid
    private List<MetricRequest> metrics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricRequest {
        @NotBlank
        @Size(max = 255)
        private String question;

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        private Double score;

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        private Double maxScore;

        @Size(max = 1000)
        private String comment;
    }
}
