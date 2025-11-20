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
import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.minhtrinh.hcmuttssbackend.entity.Session;
import org.minhtrinh.hcmuttssbackend.entity.SessionEnrollment;
import org.minhtrinh.hcmuttssbackend.entity.User;
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

    public SessionService(jpaSessionRepository sessionRepository, ClassRepository classRepository,
                          UniversityStaffRepository staffRepository,
                          UserProfilePersistenceService userProfilePersistenceService, 
                          UserRepository userRepository, 
                          StudentRepository studentRepository,
                          SessionRegistrationRepository sessionRegistrationRepository) {
        this.sessionRepository = sessionRepository;
        this.classRepository = classRepository;
        this.staffRepository = staffRepository;
        this.userProfilePersistenceService = userProfilePersistenceService;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.sessionRegistrationRepository = sessionRegistrationRepository;
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
        // Implementation for creating a session for a class
        // This is a placeholder for actual logic
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
                .orElseThrow(() -> new RuntimeException("Staff profile not found for user"));
        String staffId = staff.getStaffId();
        
        Optional<Class> existingClass = classRepository.findByClassIdAndTutor_StaffId(classId, staffId);
        if (existingClass.isEmpty()) {
            throw new RuntimeException("Class not found or user is not the tutor of the class");
        }

        String startTime = request.startTime();
        String endTime = request.endTime();
        String location = request.location();
        String sessionType = request.sessionType();
        Integer capacity = request.capacity(); // Will use entity default (30) if null
        String description = request.description();
        String title = request.title();

        // Parse ISO 8601 datetime with timezone (e.g., "2025-11-19T02:00:00.000Z")
        java.time.LocalDateTime parsedStartTime = java.time.OffsetDateTime.parse(startTime)
                .toLocalDateTime();
        java.time.LocalDateTime parsedEndTime = java.time.OffsetDateTime.parse(endTime)
                .toLocalDateTime();

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
        
        // Only set maxStudents if provided, otherwise use entity default (30)
        if (capacity != null) {
            sessionBuilder.maxStudents(capacity);
        }
        
        Session newSession = sessionBuilder.build(); // status defaults to "SCHEDULED" via @Builder.Default

        sessionRepository.save(newSession);
    }

    @Transactional 
    public void cancelSession(Long sessionId, TssUserPrincipal principal) {
        // Implementation for canceling a session
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
        session.setStatus("CANCELLED");
        sessionRepository.save(session);
    }

    @Transactional
    public SessionRescheduleResponse rescheduleSession(RescheduleRequest request, TssUserPrincipal principal) {
        // Implementation for rescheduling a session
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
        //check if the new time conflicts with other sessions of the tutor
        //get all sessions of the tutor
        java.time.LocalDateTime parsedStartTime = java.time.LocalDateTime.parse(newStartTime);
        java.time.LocalDateTime parsedEndTime = java.time.LocalDateTime.parse(newEndTime);
        List<SessionResponse> sessions = getallSessionsByUserID(principal);
        for (SessionResponse s : sessions) {
            if (s.sessionId().equals(sessionId)) {
                continue; //skip the session being rescheduled
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
        session.setStartTime(parsedStartTime); 
        session.setEndTime(parsedEndTime);
        session.setTitle(request.newSessionTitle());
        sessionRepository.save(session);

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
        // Implementation for deleting a session
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

        sessionRepository.deleteById(sessionId);
    }

    @Transactional
    public void cancelSessionByTutor(Long sessionId, TssUserPrincipal principal) {
        // Implementation for tutor to cancel a session
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
        session.setStatus("CANCELLED");
        sessionRepository.save(session);
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
            return sessionRepository.findByClazz_Tutor_StaffId(tutorStaffId).stream()
                    .map(this::mapToSessionResponse)
                    .collect(Collectors.toList());
        }

        // If user is a student -> return sessions they are enrolled in via session registrations
        var maybeStudent = studentRepository.findByUser_UserId(userId);
        if (maybeStudent.isPresent()) {
            Integer studentUserId = maybeStudent.get().getUserId();
            return sessionRegistrationRepository.findByStudent_UserId(studentUserId).stream()
                    .map(SessionEnrollment::getSession)
                    .filter(Objects::nonNull)
                    .map(this::mapToSessionResponse)
                    .collect(Collectors.toList());
        }

        // Neither tutor nor student -> return empty list
        return List.of();
    }

    public List<SessionResponse> getallSessionsByClassID(Long classId) {
        // ensure authenticated and user record exists

        // If user is a tutor (has a UniversityStaff record) -> return sessions they teach
            return sessionRepository.findByClazz_ClassId(classId).stream()
                    .map(this::mapToSessionResponse)
                    .collect(Collectors.toList());

        // If user is a student -> return sessions they are enrolled in via session registrations
    
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