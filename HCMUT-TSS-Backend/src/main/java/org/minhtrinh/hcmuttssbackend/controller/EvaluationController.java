package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.*;
import org.minhtrinh.hcmuttssbackend.service.EvaluationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/evaluation", "/api/evaluation"})
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    /**
     * Step 2: Get list of courses taught by the tutor
     * GET /api/evaluation/tutor-courses
     */
    @GetMapping("/tutor-courses")
    public ResponseEntity<List<TutorCourseResponse>> getTutorCourses(
            @AuthenticationPrincipal TssUserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = principal.getDatacoreUser().email();
        List<TutorCourseResponse> courses = evaluationService.getTutorCourses(userEmail);

        return ResponseEntity.ok(courses);
    }

    /**
     * Step 4: Get enrolled students for a specific class
     * GET /api/evaluation/class/{classId}/students
     */
    @GetMapping("/class/{classId}/students")
    public ResponseEntity<?> getEnrolledStudents(
            @AuthenticationPrincipal TssUserPrincipal principal,
            @PathVariable Long classId) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String userEmail = principal.getDatacoreUser().email();
            List<EnrolledStudentResponse> students = evaluationService.getEnrolledStudents(classId, userEmail);

            return ResponseEntity.ok(students);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Step 8: Submit evaluation for a student
     * POST /api/evaluation/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitEvaluation(
            @AuthenticationPrincipal TssUserPrincipal principal,
            @RequestBody SubmitEvaluationRequest request) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        try {
            String userEmail = principal.getDatacoreUser().email();
            EvaluationResponse response = evaluationService.submitEvaluation(userEmail, request);

            // Step 10: Return success message
            return ResponseEntity.ok(Map.of(
                    "message", "Evaluation submitted successfully",
                    "evaluation", response
            ));
        } catch (IllegalArgumentException e) {
            // Alternative flow A1: Missing required fields
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to submit evaluation: " + e.getMessage()));
        }
    }

    /**
     * Get tutor's own evaluations
     * GET /api/evaluation/my-evaluations
     */
    @GetMapping("/my-evaluations")
    public ResponseEntity<List<EvaluationResponse>> getMyEvaluations(
            @AuthenticationPrincipal TssUserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = principal.getDatacoreUser().email();
        List<EvaluationResponse> evaluations = evaluationService.getTutorEvaluations(userEmail);

        return ResponseEntity.ok(evaluations);
    }

    /**
     * Get all evaluations for a specific course
     * GET /api/evaluation/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EvaluationResponse>> getCourseEvaluations(@PathVariable Long courseId) {
        List<EvaluationResponse> evaluations = evaluationService.getCourseEvaluations(courseId);
        return ResponseEntity.ok(evaluations);
    }

    /**
     * Get all evaluations for a specific class
     * GET /api/evaluation/class/{classId}
     */
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<EvaluationResponse>> getClassEvaluations(@PathVariable Long classId) {
        List<EvaluationResponse> evaluations = evaluationService.getClassEvaluations(classId);
        return ResponseEntity.ok(evaluations);
    }

    /**
     * Get evaluations for a specific student
     * GET /api/evaluation/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EvaluationResponse>> getStudentEvaluations(@PathVariable String studentId) {
        List<EvaluationResponse> evaluations = evaluationService.getStudentEvaluations(studentId);
        return ResponseEntity.ok(evaluations);
    }

    /**
     * Get specific evaluation for a student in a class
     * GET /api/evaluation/student/{studentId}/class/{classId}
     */
    @GetMapping("/student/{studentId}/class/{classId}")
    public ResponseEntity<?> getStudentEvaluationForClass(
            @PathVariable String studentId,
            @PathVariable Long classId) {

        try {
            EvaluationResponse evaluation = evaluationService.getStudentEvaluationForClass(studentId, classId);
            return ResponseEntity.ok(evaluation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

