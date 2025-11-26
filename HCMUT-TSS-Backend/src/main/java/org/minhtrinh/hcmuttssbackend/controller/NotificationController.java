package org.minhtrinh.hcmuttssbackend.controller;

import lombok.RequiredArgsConstructor;
import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.NotificationResponse;
import org.minhtrinh.hcmuttssbackend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAllNotifications(
            @AuthenticationPrincipal TssUserPrincipal principal) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(principal);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @AuthenticationPrincipal TssUserPrincipal principal) {
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(principal);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal TssUserPrincipal principal) {
        Long count = notificationService.getUnreadCount(principal);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        notificationService.markAsRead(id, principal);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal TssUserPrincipal principal) {
        notificationService.markAllAsRead(principal);
        return ResponseEntity.ok().build();
    }
}

