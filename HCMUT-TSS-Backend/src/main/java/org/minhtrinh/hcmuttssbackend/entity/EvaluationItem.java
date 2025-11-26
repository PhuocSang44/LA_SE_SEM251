package org.minhtrinh.hcmuttssbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluation_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne
    @JoinColumn(name = "evaluation_id", nullable = false)
    private Evaluation evaluation;

    @Column(name = "criterion", nullable = false, length = 500)
    private String criterion;

    @Column(name = "rating_value", nullable = false)
    private Integer ratingValue;

    @Column(name = "max_rating", nullable = false)
    @Builder.Default
    private Integer maxRating = 5;
}

