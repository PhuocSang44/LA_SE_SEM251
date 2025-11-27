package org.minhtrinh.hcmuttssbackend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.EnrollMentSessionRequest;
import org.minhtrinh.hcmuttssbackend.entity.ActivityLog;
import org.minhtrinh.hcmuttssbackend.entity.Session;
import org.minhtrinh.hcmuttssbackend.entity.SessionEnrollment;
import org.minhtrinh.hcmuttssbackend.entity.Student;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.service.ActivityLogService;
import org.minhtrinh.hcmuttssbackend.repository.SessionRegistrationRepository;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.minhtrinh.hcmuttssbackend.repository.jpaSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;


@Service
public class SessionRegistrationService {
    private final jpaSessionRepository sessionRepository;
    private final SessionRegistrationRepository sessionRegistrationRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ActivityLogService activityLogService;

    public SessionRegistrationService(jpaSessionRepository sessionRepository,
                               SessionRegistrationRepository sessionRegistrationRepository,
                               UserRepository userRepository,
                               StudentRepository studentRepository,
                               ActivityLogService activityLogService) {
        this.sessionRepository = sessionRepository;
        this.sessionRegistrationRepository = sessionRegistrationRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional
    public void registerStudentToSession(EnrollMentSessionRequest request, TssUserPrincipal principal) {
        // Implementation for registering a student to a session
        // This is a placeholder for actual logic
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getEmail()));
        
        Student student = studentRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + user.getEmail()));
        
        Session sessionentity = null;
        if (request.sessionId() != null) {
            sessionentity = sessionRepository.findById(request.sessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found with id: " + request.sessionId()));
        } else {
            throw new RuntimeException("Session ID must be provided");
        }
        // Check if the student is already registered for the session
        boolean alreadyRegistered = sessionRegistrationRepository
                .existsBySession_SessionIdAndStudent_UserId(sessionentity.getSessionId(), student.getUserId());
        if (alreadyRegistered) {
            throw new RuntimeException("Student is already registered for this session");
        }
        //check if the session conflict with other session
        List<SessionEnrollment> enrollments = sessionRegistrationRepository.findByStudent_UserId(student.getUserId());

        if (enrollments != null) {
            for (SessionEnrollment e : enrollments) {
                Session s = e.getSession();
                if (s == null || s.getSessionId() == null) continue;
                if (s.getSessionId().equals(sessionentity.getSessionId())) continue;

                if (s.getStartTime() != null && s.getEndTime() != null
                        && sessionentity.getStartTime() != null && sessionentity.getEndTime() != null) {
                    boolean overlap = s.getStartTime().isBefore(sessionentity.getEndTime())
                            && s.getEndTime().isAfter(sessionentity.getStartTime());
                    if (overlap) {
                        throw new RuntimeException("Session time conflicts with another registered session");
                    }
                }
            }
        }

        //check if the session is full
        Integer sessionCapacity = sessionentity.getMaxStudents();
        if (sessionCapacity != null && sessionCapacity > 0) {
            long enrolledCount = sessionRegistrationRepository.countBySession_SessionId(sessionentity.getSessionId());
            if (enrolledCount >= sessionCapacity) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Session is full");
            }
        }
        //check if the session is cancel
        if ("CANCELLED".equalsIgnoreCase(sessionentity.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot register to a cancelled session");
        }


        SessionEnrollment enrollment = SessionEnrollment.builder()
                .session(sessionentity)
                .student(student)
                .enrollmentDate(LocalDateTime.now())
                .build();

        sessionRegistrationRepository.save(enrollment);
        
        try {
            int updated = sessionRepository.incrementCurrentStudentsIfSpace(sessionentity.getSessionId());
            if (updated == 0) {
                long updatedCount = sessionRegistrationRepository.countBySession_SessionId(sessionentity.getSessionId());
                sessionentity.setCurrentStudents((int) updatedCount);
                sessionRepository.save(sessionentity);
            }
        } catch (Exception e) {

        }

        // Log activity to database
        String sessionTitle = sessionentity.getTitle() != null ? sessionentity.getTitle() : "Untitled Session";
        Long classId = sessionentity.getClazz() != null ? sessionentity.getClazz().getClassId() : null;
        String startTime = sessionentity.getStartTime() != null ? sessionentity.getStartTime().toString() : "N/A";

        ActivityLog activityLog = ActivityLog.builder()
                .userId(user.getUserId())
                .action("JOIN_SESSION")
                .entityType("SESSION")
                .entityId(sessionentity.getSessionId())
                .description(String.format("Student enrolled in session '%s' (ID: %d) for class ID %d. Session starts at %s",
                        sessionTitle, sessionentity.getSessionId(), classId, startTime))
                .build();
        activityLogService.safeSave(activityLog);
    }

    @Transactional
    public void unregisterStudentFromSession(EnrollMentSessionRequest request, TssUserPrincipal principal) {
        // Validate principal and find user/student
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getEmail()));

        Student student = studentRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + user.getEmail()));

        if (request == null || request.sessionId() == null) {
            throw new RuntimeException("Session ID must be provided");
        }

        Session sessionentity = sessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + request.sessionId()));

        // Capture the sessionId in a final/effectively-final local variable for lambda use
        final Long sessionId = sessionentity.getSessionId();

        SessionEnrollment enrollment = sessionRegistrationRepository
                .findByStudent_UserId(student.getUserId()).stream()
                .filter(e -> e != null && e.getSession() != null && sessionId.equals(e.getSession().getSessionId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Enrollment not found for student in this session"));

        // Capture session details before deletion for logging
        String sessionTitle = sessionentity.getTitle() != null ? sessionentity.getTitle() : "Untitled Session";
        Long classId = sessionentity.getClazz() != null ? sessionentity.getClazz().getClassId() : null;
        LocalDateTime enrollmentDate = enrollment.getEnrollmentDate();

        sessionRegistrationRepository.delete(enrollment);
        try {
            int dec = sessionRepository.decrementCurrentStudentsIfPositive(sessionentity.getSessionId());
            if (dec == 0) {
                // Fallback to recalculating count
                long updatedCount = sessionRegistrationRepository.countBySession_SessionId(sessionentity.getSessionId());
                sessionentity.setCurrentStudents((int) updatedCount);
                sessionRepository.save(sessionentity);
            }
        } catch (Exception e) {
        }

        // Log activity to database
        ActivityLog activityLog = ActivityLog.builder()
                .userId(user.getUserId())
                .action("LEAVE_SESSION")
                .entityType("SESSION")
                .entityId(sessionentity.getSessionId())
                .description(String.format("Student unenrolled from session '%s' (ID: %d) for class ID %d. Was enrolled since %s",
                        sessionTitle, sessionentity.getSessionId(), classId,
                        enrollmentDate != null ? enrollmentDate.toString() : "unknown"))
                .build();
        activityLogService.safeSave(activityLog);
    }
}
