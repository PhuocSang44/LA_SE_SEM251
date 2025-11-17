package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.EnrollMentSessionRequest;
import org.minhtrinh.hcmuttssbackend.service.SessionRegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sessions")
public class SessionEnrollmentController {

    private final SessionRegistrationService sessionRegistrationService;

    public SessionEnrollmentController(SessionRegistrationService sessionRegistrationService) {
        this.sessionRegistrationService = sessionRegistrationService;
    }

    /**
     * Enroll authenticated student into a session.
     * Body: EnrollMentSessionRequest { Long sessionId, ... }
     */
    @PostMapping("/enroll")
    public ResponseEntity<Void> enroll(@RequestBody EnrollMentSessionRequest req,
                                       @AuthenticationPrincipal TssUserPrincipal principal) {
        sessionRegistrationService.registerStudentToSession(req, principal);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}