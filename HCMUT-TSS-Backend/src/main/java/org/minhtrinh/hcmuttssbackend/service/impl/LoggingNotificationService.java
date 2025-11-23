package org.minhtrinh.hcmuttssbackend.service.impl;

import org.minhtrinh.hcmuttssbackend.entity.Feedback;
import org.minhtrinh.hcmuttssbackend.entity.PerformanceEvaluation;
import org.minhtrinh.hcmuttssbackend.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LoggingNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(LoggingNotificationService.class);

    @Override
    public void notifyFeedbackSubmitted(Feedback feedback) {
        log.info("Feedback {} submitted by student {}", feedback.getFeedbackId(),
                feedback.getStudent().getStudentId());
    }

    @Override
    public void notifyFeedbackModerated(Feedback feedback) {
        log.info("Feedback {} status changed to {}", feedback.getFeedbackId(), feedback.getStatus());
    }

    @Override
    public void notifyPerformanceEvaluationCreated(PerformanceEvaluation evaluation) {
        log.info("Performance evaluation {} created for student {} in class {}", evaluation.getEvaluationId(),
                evaluation.getStudent().getStudentId(), evaluation.getClassEntity().getClassId());
    }
}
