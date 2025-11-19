package org.minhtrinh.hcmuttssbackend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.EnrollMentSessionRequest;
import org.minhtrinh.hcmuttssbackend.entity.Session;
import org.minhtrinh.hcmuttssbackend.entity.SessionEnrollment;
import org.minhtrinh.hcmuttssbackend.entity.Student;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.repository.SessionRegistrationRepository;
import org.minhtrinh.hcmuttssbackend.repository.jpaSessionRepository;
import org.minhtrinh.hcmuttssbackend.repository.StudentRepository;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
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

    public SessionRegistrationService(jpaSessionRepository sessionRepository,
                               SessionRegistrationRepository sessionRegistrationRepository,
                               UserRepository userRepository,
                               StudentRepository studentRepository) {
        this.sessionRepository = sessionRepository;
        this.sessionRegistrationRepository = sessionRegistrationRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
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
                .existsBySession_SessionIdAndStudent_StudentId(sessionentity.getSessionId(), student.getStudentId());
        if (alreadyRegistered) {
            throw new RuntimeException("Student is already registered for this session");
        }
        //check if the session conflict with other session
        List<SessionEnrollment> enrollments = sessionRegistrationRepository.findByStudent_StudentId(student.getStudentId());

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
                .findByStudent_StudentId(student.getStudentId()).stream()
                .filter(e -> e != null && e.getSession() != null && sessionId.equals(e.getSession().getSessionId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Enrollment not found for student in this session"));

        sessionRegistrationRepository.delete(enrollment);
    }
}
