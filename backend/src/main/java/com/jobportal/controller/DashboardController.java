package com.jobportal.controller;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.DashboardDto;
import com.jobportal.dto.NotificationDto;
import com.jobportal.security.UserDetailsImpl;
import com.jobportal.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    private UUID userId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @GetMapping("/seeker")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<DashboardDto.SeekerDashboard>> seekerDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSeekerDashboard(userId())));
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<DashboardDto.RecruiterDashboard>> recruiterDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRecruiterDashboard(userId())));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardDto.AdminDashboard>> adminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboard()));
    }
}
