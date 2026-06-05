package com.ubs.controller;

import com.ubs.dto.response.NotificationResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.enums.NotificationStatus;
import com.ubs.enums.NotificationType;
import com.ubs.service.NotificationService;
import com.ubs.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "List notifications")
    public ResponseEntity<PageResponse<NotificationResponse>> listNotifications(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) NotificationType notificationType,
            @RequestParam(required = false) NotificationStatus status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection) {
        return ResponseEntity.ok(notificationService.listNotifications(customerId, notificationType, status,
                page, size, sortBy, sortDirection));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get notifications for the authenticated customer")
    public ResponseEntity<PageResponse<NotificationResponse>> getMyNotifications(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection) {
        return ResponseEntity.ok(notificationService.getMyNotifications(page, size, sortBy, sortDirection));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Get notification by ID")
    public ResponseEntity<NotificationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getById(id));
    }

    @PostMapping("/send-pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Trigger async sending of pending notifications")
    public ResponseEntity<Map<String, String>> sendPending() {
        notificationService.sendPendingNotifications();
        return ResponseEntity.ok(Map.of("message", "Pending notifications are being processed"));
    }
}
