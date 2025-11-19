package org.minhtrinh.hcmuttssbackend.service;
import java.util.Optional;
import java.util.stream.Collectors;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.CreateSessionRequest;
import org.minhtrinh.hcmuttssbackend.dto.RescheduleRequest;
import org.minhtrinh.hcmuttssbackend.dto.SessionRescheduleResponse;
import org.minhtrinh.hcmuttssbackend.entity.Class;
import org.minhtrinh.hcmuttssbackend.entity.Session;
import org.minhtrinh.hcmuttssbackend.entity.SessionEnrollment;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.repository.ClassRepository;
import org.minhtrinh.hcmuttssbackend.repository.jpaSessionRepository;
import org.minhtrinh.hcmuttssbackend.repository.UniversityStaffRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.repository.SessionRegistrationRepository;
import org.minhtrinh.hcmuttssbackend.dto.SessionResponse;


import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Objects;
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
        String classId = request.classId();
        Optional<Class> existingClass = classRepository.findByCourse_CodeAndTutor_OfficialId(classId, userId.longValue());
        if (existingClass.isEmpty()) {
            throw new RuntimeException("Class not found or user is not the tutor of the class");
        }

        String startTime = request.startTime();
        String endTime = request.endTime();
        String location = request.location();
        String sessionType = request.sessionType();
        Integer capacity = request.capacity();
        String description = request.description();

        Session newSession = Session.builder()
                .clazz(existingClass.get())
                .startTime(java.time.LocalDateTime.parse(startTime))
                .endTime(java.time.LocalDateTime.parse(endTime))
                .location(location)
                .sessionType(sessionType)
                .maxStudents(capacity)
                .description(description)
                .createdAt(java.time.LocalDateTime.now())
                .build();

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
        if (!sessionOpt.get().getClazz().getTutor().getOfficialId().equals(getUserIdFromPrincipal(principal).longValue())) {
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
        if (!sessionOpt.get().getClazz().getTutor().getOfficialId().equals(getUserIdFromPrincipal(principal).longValue())) {
            throw new RuntimeException("User is not authorized to reschedule this session");
        }
        //check if the new time conflicts with other sessions of the tutor
        //get all sessions of the tutor
        Long tutorId = sessionOpt.get().getClazz().getTutor().getOfficialId();
        var sessions = sessionRepository.findByClazz_Tutor_OfficialId(tutorId);
        for (Session s : sessions) {
            if (s.getSessionId().equals(sessionId)) continue;

            if (s.getStartTime() != null && s.getEndTime() != null
                    && newStartTime != null && newEndTime != null) {
                boolean overlap = s.getStartTime().isBefore(java.time.LocalDateTime.parse(newEndTime))
                        && s.getEndTime().isAfter(java.time.LocalDateTime.parse(newStartTime));
                if (overlap) {
                    throw new RuntimeException("New session time conflicts with another session of the tutor");
                }
            }
        }

        Session session = sessionOpt.get();
        session.setStartTime(java.time.LocalDateTime.parse(newStartTime));
        session.setEndTime(java.time.LocalDateTime.parse(newEndTime));
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
        if (!sessionOpt.get().getClazz().getTutor().getOfficialId().equals(getUserIdFromPrincipal(principal).longValue())) {
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
        if (!sessionOpt.get().getClazz().getTutor().getOfficialId().equals(getUserIdFromPrincipal(principal).longValue())) {
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
        var maybeStaff = staffRepository.findByUserId(userId);
        if (maybeStaff.isPresent()) {
            Long tutorOfficialId = maybeStaff.get().getOfficialId();
            return sessionRepository.findByClazz_Tutor_OfficialId(tutorOfficialId).stream()
                    .map(this::mapToSessionResponse)
                    .collect(Collectors.toList());
        }

        // If user is a student -> return sessions they are enrolled in via session registrations
        var maybeStudent = studentRepository.findByUserId(userId);
        if (maybeStudent.isPresent()) {
            Long studentId = maybeStudent.get().getStudentId();
            return sessionRegistrationRepository.findByStudent_StudentId(studentId).stream()
                    .map(SessionEnrollment::getSession)
                    .filter(Objects::nonNull)
                    .map(this::mapToSessionResponse)
                    .collect(Collectors.toList());
        }

        // Neither tutor nor student -> return empty list
        return List.of();
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

        return new SessionResponse(sessionId, classId, sessionTitle, startTime, endTime, location, sessionType, capacity, description);
    }
}    