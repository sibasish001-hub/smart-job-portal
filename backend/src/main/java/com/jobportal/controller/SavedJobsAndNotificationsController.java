package com.jobportal.controller;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.JobResponse;
import com.jobportal.dto.NotificationDto;
import com.jobportal.security.UserDetailsImpl;
import com.jobportal.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SavedJobsAndNotificationsController {

    private final DashboardService dashboardService;

    private UUID userId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    // ─── Saved Jobs ─────────────────────────────────────────────────

    @PostMapping("/api/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<String>> saveJob(@PathVariable UUID jobId) {
        dashboardService.saveJob(userId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job saved successfully"));
    }

    @DeleteMapping("/api/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<String>> unsaveJob(@PathVariable UUID jobId) {
        dashboardService.unsaveJob(userId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job removed from saved list"));
    }

    @GetMapping("/api/saved-jobs")
    public ResponseEntity<ApiResponse<List<Object>>> getSavedJobs() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSavedJobs(userId())));
    }

    @GetMapping("/api/saved-jobs/{jobId}/check")
    public ResponseEntity<ApiResponse<Boolean>> isJobSaved(@PathVariable UUID jobId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.isJobSaved(userId(), jobId)));
    }

    // ─── Notifications ──────────────────────────────────────────────

    @GetMapping("/api/notifications")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getNotifications(userId())));
    }

    @PatchMapping("/api/notifications/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markRead(@PathVariable UUID notificationId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.markNotificationRead(userId(), notificationId)));
    }

    @PatchMapping("/api/notifications/read-all")
    public ResponseEntity<ApiResponse<String>> markAllRead() {
        dashboardService.markAllNotificationsRead(userId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
