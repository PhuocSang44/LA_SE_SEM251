package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.entity.ActivityLog;
import org.minhtrinh.hcmuttssbackend.repository.ActivityLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import java.util.List;

@Service
public class ActivityLogService {

    private static final Logger logger = LoggerFactory.getLogger(ActivityLogService.class);

    private final ActivityLogRepository activityLogRepository;
    private final ApplicationContext applicationContext;

    public ActivityLogService(ActivityLogRepository activityLogRepository, ApplicationContext applicationContext) {
        this.activityLogRepository = activityLogRepository;
        this.applicationContext = applicationContext;
    }

    @Transactional
    public ActivityLog saveLog(ActivityLog log) {
        return activityLogRepository.save(log);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ActivityLog saveLogRequiresNew(ActivityLog log) {
        return activityLogRepository.save(log);
    }

    public List<ActivityLog> findAll() {
        return activityLogRepository.findAll();
    }

    // Helper that attempts to save in a new transaction via proxy to avoid contaminating caller transaction
    public void safeSave(ActivityLog log) {
        try {
            ActivityLogService proxy = applicationContext.getBean(ActivityLogService.class);
            proxy.saveLogRequiresNew(log);
        } catch (Exception ex) {
            logger.warn("Failed to save activity log: {}", ex.getMessage());
        }
    }
}
