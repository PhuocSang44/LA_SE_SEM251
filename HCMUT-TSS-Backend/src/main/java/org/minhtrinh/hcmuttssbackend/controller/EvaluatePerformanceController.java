package org.minhtrinh.hcmuttssbackend.controller;

import jakarta.validation.Valid;
import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.EvaluatePerformanceRequest;
import org.minhtrinh.hcmuttssbackend.dto.PerformanceEvaluationResponse;
import org.minhtrinh.hcmuttssbackend.service.EvaluatePerformanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/performance-evaluations")
public class EvaluatePerformanceController {

    private final EvaluatePerformanceService evaluatePerformanceService;

    public EvaluatePerformanceController(EvaluatePerformanceService evaluatePerformanceService) {
        this.evaluatePerformanceService = evaluatePerformanceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_TUTOR','ROLE_ADMIN')")
    public ResponseEntity<?> submitEvaluation(
            @AuthenticationPrincipal TssUserPrincipal principal,
            @Valid @RequestBody EvaluatePerformanceRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            PerformanceEvaluationResponse response = evaluatePerformanceService
                    .submitEvaluation(principal.getDatacoreUser().email(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (AccessDeniedException ex) {
            return buildError(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyAuthority('ROLE_TUTOR','ROLE_ADMIN')")
    public ResponseEntity<?> getClassEvaluations(
            @AuthenticationPrincipal TssUserPrincipal principal,
            @PathVariable Long classId) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            List<PerformanceEvaluationResponse> responses = evaluatePerformanceService
                    .getEvaluationsForClass(principal.getDatacoreUser().email(), classId);
            return ResponseEntity.ok(responses);
        } catch (IllegalArgumentException ex) {
            return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (AccessDeniedException ex) {
            return buildError(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> getStudentEvaluations(
            @AuthenticationPrincipal TssUserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<PerformanceEvaluationResponse> responses = evaluatePerformanceService
                .getEvaluationsForStudent(principal.getDatacoreUser().email());
        return ResponseEntity.ok(responses);
    }

    private ResponseEntity<Map<String, String>> buildError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
