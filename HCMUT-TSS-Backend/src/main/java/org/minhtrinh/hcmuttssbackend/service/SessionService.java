package org.minhtrinh.hcmuttssbackend.service;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.CreateSessionRequest;
import org.minhtrinh.hcmuttssbackend.dto.RescheduleRequest;
import org.minhtrinh.hcmuttssbackend.dto.SessionRescheduleResponse;
import org.minhtrinh.hcmuttssbackend.dto.SessionResponse;
import org.minhtrinh.hcmuttssbackend.entity.ActivityLog;
import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.minhtrinh.hcmuttssbackend.entity.Session;
import org.minhtrinh.hcmuttssbackend.entity.SessionEnrollment;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.repository.ActivityLogRepository;
import org.minhtrinh.hcmuttssbackend.repository.ClassRepository;
import org.minhtrinh.hcmuttssbackend.repository.SessionRegistrationRepository;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.repository.UniversityStaffRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.minhtrinh.hcmuttssbackend.repository.jpaSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
@Service
public class SessionService {
    private final jpaSessionRepository sessionRepository;
    private final ClassRepository classRepository;
    private final UniversityStaffRepository staffRepository;
    private final UserProfilePersistenceService userProfilePersistenceService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final SessionRegistrationRepository sessionRegistrationRepository;
    private final ActivityLogRepository activityLogRepository;

    public SessionService(jpaSessionRepository sessionRepository, ClassRepository classRepository,
                          UniversityStaffRepository staffRepository,
                          UserProfilePersistenceService userProfilePersistenceService, 
                          UserRepository userRepository, 
                          StudentRepository studentRepository,
                          SessionRegistrationRepository sessionRegistrationRepository,
                          ActivityLogRepository activityLogRepository) {
        this.sessionRepository = sessionRepository;
        this.classRepository = classRepository;
        this.staffRepository = staffRepository;
        this.userProfilePersistenceService = userProfilePersistenceService;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.sessionRegistrationRepository = sessionRegistrationRepository;
        this.activityLogRepository = activityLogRepository;
    }

    private User getUserFromPrincipal(TssUserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("User must be authenticated");
        }
        userProfilePersistenceService.ensureUserSubProfilePersisted(principal);
        return userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getEmail()));
    }

    private Integer getUserIdFromPrincipal(TssUserPrincipal principal) {
        if (principal == null) return null;
        return userRepository.findByEmail(principal.getEmail()).map(User::getUserId).orElse(null);
    }



    @Transactional
    public void createSessionForClass(CreateSessionRequest request, TssUserPrincipal principal) {


        if (principal == null) {
            throw new RuntimeException("User must be authenticated to create a session");
        }

        var user = getUserFromPrincipal(principal);
        Integer userId = user.getUserId();
        String classIdStr = request.classId();
        
        // Parse classId to Long
        Long classId;
        try {
            classId = Long.parseLong(classIdStr);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid class ID format: " + classIdStr);
        }
        
        // Get staff record to find staffId
        var staff = staffRepository.findByUser_UserId(userId)
                .orElseThrow(() -> {
                    return new RuntimeException("Staff profile not found for user");
                });
        String staffId = staff.getStaffId();

        Optional<Class> existingClass = classRepository.findByClassIdAndTutor_StaffId(classId, staffId);
        if (existingClass.isEmpty()) {
            throw new RuntimeException("Class not found or user is not the tutor of the class");
        }

        String startTime = request.startTime();
        String endTime = request.endTime();
        String location = request.location();
        String sessionType = request.sessionType();
        Integer capacity = request.capacity();
        String description = request.description();
        String title = request.title();

        // Parse ISO 8601 datetime with timezone
        java.time.LocalDateTime parsedStartTime = java.time.OffsetDateTime.parse(startTime)
                .toLocalDateTime();
        java.time.LocalDateTime parsedEndTime = java.time.OffsetDateTime.parse(endTime)
                .toLocalDateTime();

        // Check for time conflicts
        List<SessionResponse> sessions = getallSessionsByUserID(principal);
        for (SessionResponse s : sessions) {
            if (s.startTime() != null && s.endTime() != null
                    && startTime != null && endTime != null) {
                boolean overlap = java.time.LocalDateTime.parse(s.startTime()).isBefore(parsedEndTime)
                        && java.time.LocalDateTime.parse(s.endTime()).isAfter(parsedStartTime);
                if (overlap) {
                    throw new RuntimeException("New session time conflicts with another session of the tutor");
                }
            }
        }

        Session.SessionBuilder sessionBuilder = Session.builder()
                .clazz(existingClass.get())
                .title(title)
                .startTime(parsedStartTime)
                .endTime(parsedEndTime)
                .location(location)
                .sessionType(sessionType)
                .description(description)
                .createdAt(java.time.LocalDateTime.now());
        
        if (capacity != null) {
            sessionBuilder.maxStudents(capacity);
        }
        
        Session newSession = sessionBuilder.build();

        sessionRepository.save(newSession);

        // Log activity to database
        ActivityLog activityLog = ActivityLog.builder()
                .userId(userId)
                .action("CREATE_SESSION")
                .entityType("SESSION")
                .entityId(newSession.getSessionId())
                .description(String.format("Created session '%s' (%s) for class ID %d from %s to %s at %s",
                        title, sessionType, classId, parsedStartTime, parsedEndTime, location))
                .build();
        activityLogRepository.save(activityLog);
    }

    @Transactional 
    public void cancelSession(Long sessionId, TssUserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("User must be authenticated to cancel a session");
        }

        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            throw new RuntimeException("Session not found with ID: " + sessionId);
        }

        Integer currentUserId = getUserIdFromPrincipal(principal);
        Integer tutorUserId = sessionOpt.get().getClazz().getTutor().getUserId();

        if (!tutorUserId.equals(currentUserId)) {
            throw new RuntimeException("User is not authorized to cancel this session");
        }

        Session session = sessionOpt.get();
        String previousStatus = session.getStatus();
        String sessionTitle = session.getTitle();
        Long classIdForLog = session.getClazz() != null ? session.getClazz().getClassId() : null;

        session.setStatus("CANCELLED");
        sessionRepository.save(session);

        // Log activity to database
        ActivityLog activityLog = ActivityLog.builder()
                .userId(currentUserId)
                .action("CANCEL_SESSION")
                .entityType("SESSION")
                .entityId(sessionId)
                .description(String.format("Cancelled session '%s' (ID: %d) for class ID %d. Previous status: %s",
                        sessionTitle, sessionId, classIdForLog, previousStatus))
                .build();
        activityLogRepository.save(activityLog);
    }

    @Transactional
    public SessionRescheduleResponse rescheduleSession(RescheduleRequest request, TssUserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("User must be authenticated to reschedule a session");
        }

        Long sessionId = request.sessionId();
        String newStartTime = request.newStartTime();
        String newEndTime = request.newEndTime();

        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            throw new RuntimeException("Session not found with ID: " + sessionId);
        }

        Integer currentUserId = getUserIdFromPrincipal(principal);
        Integer tutorUserId = sessionOpt.get().getClazz().getTutor().getUserId();

        if (!tutorUserId.equals(currentUserId)) {
            throw new RuntimeException("User is not authorized to reschedule this session");
        }

        // Parse new times
        java.time.LocalDateTime parsedStartTime = java.time.LocalDateTime.parse(newStartTime);
        java.time.LocalDateTime parsedEndTime = java.time.LocalDateTime.parse(newEndTime);

        // Check for time conflicts
        List<SessionResponse> sessions = getallSessionsByUserID(principal);

        for (SessionResponse s : sessions) {
            if (s.sessionId().equals(sessionId)) {
                continue; // skip the session being rescheduled
            }
            if (s.startTime() != null && s.endTime() != null
                    && newStartTime != null && newEndTime != null) {
                boolean overlap = java.time.LocalDateTime.parse(s.startTime()).isBefore(parsedEndTime)
                        && java.time.LocalDateTime.parse(s.endTime()).isAfter(parsedStartTime);
                if (overlap) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "New session time conflicts with another session of the tutor");
                }
            }
        }

        Session session = sessionOpt.get();
        String oldStartTime = session.getStartTime().toString();
        String oldEndTime = session.getEndTime().toString();
        String oldTitle = session.getTitle();
        Long classIdForLog = session.getClazz() != null ? session.getClazz().getClassId() : null;

        session.setStartTime(parsedStartTime);
        session.setEndTime(parsedEndTime);
        session.setTitle(request.newSessionTitle());
        sessionRepository.save(session);

        // Log activity to database
        ActivityLog activityLog = ActivityLog.builder()
                .userId(currentUserId)
                .action("RESCHEDULE_SESSION")
                .entityType("SESSION")
                .entityId(sessionId)
                .description(String.format("Rescheduled session '%s' (ID: %d) for class ID %d. Old time: %s - %s, New time: %s - %s. Title changed from '%s' to '%s'",
                        session.getTitle(), sessionId, classIdForLog,
                        oldStartTime, oldEndTime, parsedStartTime, parsedEndTime,
                        oldTitle, request.newSessionTitle()))
                .build();
        activityLogRepository.save(activityLog);

        return new SessionRescheduleResponse(
            session.getClazz().getClassId(),
            session.getStartTime().toString(),
            session.getEndTime().toString(),
            session.getLocation(),
            session.getSessionType(),
            session.getMaxStudents(),
            session.getDescription()
        );
    }

    @Transactional
    public void deleteSession(Long sessionId, TssUserPrincipal principal) {


        if (principal == null) {
            throw new RuntimeException("User must be authenticated to delete a session");
        }

        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            throw new RuntimeException("Session not found with ID: " + sessionId);
        }

        Integer currentUserId = getUserIdFromPrincipal(principal);
        Integer tutorUserId = sessionOpt.get().getClazz().getTutor().getUserId();

        if (!tutorUserId.equals(currentUserId)) {
            throw new RuntimeException("User is not authorized to delete this session");
        }


        // Capture session details before deletion
        Session session = sessionOpt.get();
        String sessionTitle = session.getTitle();
        String sessionType = session.getSessionType();
        Long classIdForLog = session.getClazz() != null ? session.getClazz().getClassId() : null;
        String startTime = session.getStartTime() != null ? session.getStartTime().toString() : null;
        String endTime = session.getEndTime() != null ? session.getEndTime().toString() : null;

        sessionRepository.deleteById(sessionId);

        // Log activity to database
        ActivityLog activityLog = ActivityLog.builder()
                .userId(currentUserId)
                .action("DELETE_SESSION")
                .entityType("SESSION")
                .entityId(sessionId)
                .description(String.format("Deleted session '%s' (%s) (ID: %d) for class ID %d. Session was scheduled from %s to %s",
                        sessionTitle, sessionType, sessionId, classIdForLog, startTime, endTime))
                .build();
        activityLogRepository.save(activityLog);
    }

    @Transactional
    public void cancelSessionByTutor(Long sessionId, TssUserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("User must be authenticated to cancel a session");
        }

        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            throw new RuntimeException("Session not found with ID: " + sessionId);
        }

        Integer currentUserId = getUserIdFromPrincipal(principal);
        Integer tutorUserId = sessionOpt.get().getClazz().getTutor().getUserId();

        if (!tutorUserId.equals(currentUserId)) {
            throw new RuntimeException("User is not authorized to cancel this session");
        }

        Session session = sessionOpt.get();
        String previousStatus = session.getStatus();
        String sessionTitle = session.getTitle();
        Long classIdForLog = session.getClazz() != null ? session.getClazz().getClassId() : null;

        session.setStatus("CANCELLED");
        sessionRepository.save(session);

        // Log activity to database
        ActivityLog activityLog = ActivityLog.builder()
                .userId(currentUserId)
                .action("TUTOR_CANCEL_SESSION")
                .entityType("SESSION")
                .entityId(sessionId)
                .description(String.format("Tutor cancelled session '%s' (ID: %d) for class ID %d. Previous status: %s",
                        sessionTitle, sessionId, classIdForLog, previousStatus))
                .build();
        activityLogRepository.save(activityLog);
    }
    //get all enroll sessions by user id
    public List<SessionResponse> getallSessionsByUserID(TssUserPrincipal principal) {

        // ensure authenticated and user record exists
        User user = getUserFromPrincipal(principal);
        Integer userId = user.getUserId();

        // If user is a tutor (has a UniversityStaff record) -> return sessions they teach
        var maybeStaff = staffRepository.findByUser_UserId(userId);
        if (maybeStaff.isPresent()) {
            String tutorStaffId = maybeStaff.get().getStaffId();
            List<SessionResponse> sessions = sessionRepository.findByClazz_Tutor_StaffId(tutorStaffId).stream()
                    .map(this::mapToSessionResponse)
                    .collect(Collectors.toList());
            return sessions;
        }

        // If user is a student -> return sessions they are enrolled in via session registrations
        var maybeStudent = studentRepository.findByUser_UserId(userId);
        if (maybeStudent.isPresent()) {
            Integer studentUserId = maybeStudent.get().getUserId();
            List<SessionResponse> sessions = sessionRegistrationRepository.findByStudent_UserId(studentUserId).stream()
                    .map(SessionEnrollment::getSession)
                    .filter(Objects::nonNull)
                    .map(this::mapToSessionResponse)
                    .collect(Collectors.toList());
            return sessions;
        }

        // Neither tutor nor student -> return empty list
        return List.of();
    }

    // public List<SessionResponse> getallScheduleSessionsByUserID(TssUserPrincipal principal) {
    //     // ensure authenticated and user record exists
    //     User user = getUserFromPrincipal(principal);
    //     Integer userId = user.getUserId();

    //     // If user is a tutor (has a UniversityStaff record) -> return sessions they teach
    //     var maybeStaff = staffRepository.findByUser_UserId(userId);
    //     if (maybeStaff.isPresent()) {
    //         String tutorStaffId = maybeStaff.get().getStaffId();
    //         return sessionRepository.findByClazz_Tutor_StaffId(tutorStaffId).stream()
    //                 .filter(s -> s.getStatus() != null && "SCHEDULED".equalsIgnoreCase(s.getStatus()))
    //                 .map(this::mapToSessionResponse)
    //                 .collect(Collectors.toList());
    //     }

    //     // If user is a student -> return sessions they are enrolled in via session registrations
    //     var maybeStudent = studentRepository.findByUser_UserId(userId);
    //     if (maybeStudent.isPresent()) {
    //         Integer studentUserId = maybeStudent.get().getUserId();
    //         return sessionRegistrationRepository.findByStudent_UserId(studentUserId).stream()
    //                 .map(SessionEnrollment::getSession)
    //                 .filter(s -> s.getStatus() != null && "SCHEDULED".equalsIgnoreCase(s.getStatus()))
    //                 .map(this::mapToSessionResponse)
    //                 .collect(Collectors.toList());
    //     }

    //     // Neither tutor nor student -> return empty list
    //     return List.of();
    // }

    public List<SessionResponse> getallSessionsByClassID(Long classId) {
        return sessionRepository.findByClazz_ClassId(classId).stream()
                .map(this::mapToSessionResponse)
                .collect(Collectors.toList());
    }

    private SessionResponse mapToSessionResponse(Session session) {
        Long sessionId = session.getSessionId();
        Long classId = session.getClazz() != null ? session.getClazz().getClassId() : null;
        String sessionTitle = session.getTitle();
        String startTime = session.getStartTime() != null ? session.getStartTime().toString() : null;
        String endTime = session.getEndTime() != null ? session.getEndTime().toString() : null;
        String location = session.getLocation();
        String sessionType = session.getSessionType();
        Integer capacity = session.getMaxStudents();
        String description = session.getDescription();
        String status = session.getStatus();

        return new SessionResponse(sessionId, classId, sessionTitle, startTime, endTime, location, sessionType, capacity, description, status);
    }
}    