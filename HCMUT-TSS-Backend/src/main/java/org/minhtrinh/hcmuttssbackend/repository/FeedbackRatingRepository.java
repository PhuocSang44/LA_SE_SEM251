package org.minhtrinh.hcmuttssbackend.repository;

import org.minhtrinh.hcmuttssbackend.entity.FeedbackRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRatingRepository extends JpaRepository<FeedbackRating, Long> {

    List<FeedbackRating> findByFeedback_FeedbackId(Long feedbackId);

    void deleteByFeedback_FeedbackId(Long feedbackId);
}
