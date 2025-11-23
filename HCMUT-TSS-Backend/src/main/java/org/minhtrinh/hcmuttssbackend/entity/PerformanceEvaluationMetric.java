package org.minhtrinh.hcmuttssbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "performance_evaluation_metric")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceEvaluationMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "metric_id")
    private Long metricId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private PerformanceEvaluation evaluation;

    @Column(name = "question", nullable = false, length = 255)
    private String question;

    @Column(name = "score", nullable = false)
    private Double score;

    @Column(name = "max_score", nullable = false)
    private Double maxScore;

    @Column(name = "metric_comment", length = 1000)
    private String metricComment;
}
