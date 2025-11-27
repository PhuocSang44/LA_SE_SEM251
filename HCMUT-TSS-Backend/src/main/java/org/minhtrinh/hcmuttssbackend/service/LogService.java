package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.entity.ActivityLog;
import org.minhtrinh.hcmuttssbackend.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LogService {

    private final ActivityLogRepository activityLogRepository;

    public LogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveLog(ActivityLog log) {
        activityLogRepository.save(log);
    }
}
