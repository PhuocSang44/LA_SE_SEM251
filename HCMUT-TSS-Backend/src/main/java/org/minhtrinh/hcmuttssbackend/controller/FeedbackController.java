package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.EnrolledCourseResponse;
import org.minhtrinh.hcmuttssbackend.dto.FeedbackResponse;
import org.minhtrinh.hcmuttssbackend.dto.SubmitFeedbackRequest;
import org.minhtrinh.hcmuttssbackend.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/feedback", "/api/feedback"})
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /**
     * Step 2: Get list of enrolled courses for the student
     * GET /api/feedback/enrolled-courses
     */
    @GetMapping("/enrolled-courses")
    public ResponseEntity<List<EnrolledCourseResponse>> getEnrolledCourses(
            @AuthenticationPrincipal TssUserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = principal.getDatacoreUser().email();
        List<EnrolledCourseResponse> courses = feedbackService.getEnrolledCourses(userEmail);

        return ResponseEntity.ok(courses);
    }

    /**
     * Step 8: Submit feedback
     * POST /api/feedback/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(
            @AuthenticationPrincipal TssUserPrincipal principal,
            @RequestBody SubmitFeedbackRequest request) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        try {
            String userEmail = principal.getDatacoreUser().email();
            FeedbackResponse response = feedbackService.submitFeedback(userEmail, request);

            // Step 10: Return success message
            return ResponseEntity.ok(Map.of(
                    "message", "Feedback submitted successfully",
                    "feedback", response
            ));
        } catch (IllegalArgumentException e) {
            // Alternative flow A1: Missing required fields
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to submit feedback: " + e.getMessage()));
        }
    }

    /**
     * Get student's own feedback
     * GET /api/feedback/my-feedback
     */
    @GetMapping("/my-feedback")
    public ResponseEntity<List<FeedbackResponse>> getMyFeedback(
            @AuthenticationPrincipal TssUserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = principal.getDatacoreUser().email();
        List<FeedbackResponse> feedback = feedbackService.getStudentFeedback(userEmail);

        return ResponseEntity.ok(feedback);
    }

    /**
     * Get all feedback for a specific course
     * GET /api/feedback/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<FeedbackResponse>> getCourseFeedback(@PathVariable Long courseId) {
        List<FeedbackResponse> feedback = feedbackService.getCourseFeedback(courseId);
        return ResponseEntity.ok(feedback);
    }

    /**
     * Get all feedback for a specific class
     * GET /api/feedback/class/{classId}
     */
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<FeedbackResponse>> getClassFeedback(@PathVariable Long classId) {
        List<FeedbackResponse> feedback = feedbackService.getClassFeedback(classId);
        return ResponseEntity.ok(feedback);
    }

    /**
     * Get pending feedback (for admin/tutor review)
     * GET /api/feedback/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<FeedbackResponse>> getPendingFeedback(
            @AuthenticationPrincipal TssUserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // TODO: Add role check - only TUTOR/ADMIN should access this
        List<FeedbackResponse> feedback = feedbackService.getPendingFeedback();
        return ResponseEntity.ok(feedback);
    }

    /**
     * Update feedback status (approve/reject)
     * PATCH /api/feedback/{feedbackId}/status
     */
    @PatchMapping("/{feedbackId}/status")
    public ResponseEntity<?> updateFeedbackStatus(
            @AuthenticationPrincipal TssUserPrincipal principal,
            @PathVariable Long feedbackId,
            @RequestBody Map<String, String> request) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // TODO: Add role check - only TUTOR/ADMIN should access this

        try {
            String status = request.get("status");
            FeedbackResponse response = feedbackService.updateFeedbackStatus(feedbackId, status);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

