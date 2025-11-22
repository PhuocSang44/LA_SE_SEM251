package org.minhtrinh.hcmuttssbackend.controller;

import java.util.List;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.CreateSessionRequest;
import org.minhtrinh.hcmuttssbackend.dto.RescheduleRequest;
import org.minhtrinh.hcmuttssbackend.dto.SessionResponse;
import org.minhtrinh.hcmuttssbackend.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService sessionService;
    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<Void> createSession(@RequestBody CreateSessionRequest request , @AuthenticationPrincipal TssUserPrincipal principal) {
        // Implementation here
        sessionService.createSessionForClass(request, principal);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/cancelSession")
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<Void> CancelSession(@RequestBody Long sessionId , @AuthenticationPrincipal TssUserPrincipal principal) {
        // Implementation here
        sessionService.cancelSession(sessionId, principal);
        return ResponseEntity.ok().build();
    }

    @PatchMapping
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<Void> updateSession(@RequestBody RescheduleRequest request , @AuthenticationPrincipal TssUserPrincipal principal) {
        // Implementation here
        System.out.println("DEBUG: Payload for update: " + request);
        sessionService.rescheduleSession(request, principal);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<Void> deleteSession(@RequestBody Long sessionId , @AuthenticationPrincipal TssUserPrincipal principal) {
        // Implementation here
        sessionService.deleteSession(sessionId, principal);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/userId")
    public ResponseEntity<List<SessionResponse>> getSessionsByUserId(@AuthenticationPrincipal TssUserPrincipal principal) {
        List<SessionResponse> sessions = sessionService.getallSessionsByUserID(principal);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{classId}")
    public ResponseEntity<List<SessionResponse>> getSessionsByClassId(@PathVariable Long classId) {
        List<SessionResponse> sessions = sessionService.getallSessionsByClassID(classId);
        return ResponseEntity.ok(sessions);
    }
}
