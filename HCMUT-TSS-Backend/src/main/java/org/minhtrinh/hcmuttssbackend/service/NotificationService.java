package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.entity.Feedback;
import org.minhtrinh.hcmuttssbackend.entity.PerformanceEvaluation;

public interface NotificationService {

    void notifyFeedbackSubmitted(Feedback feedback);

    void notifyFeedbackModerated(Feedback feedback);

    void notifyPerformanceEvaluationCreated(PerformanceEvaluation evaluation);
}
