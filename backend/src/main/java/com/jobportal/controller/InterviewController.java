package com.jobportal.controller;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.InterviewRequest;
import com.jobportal.dto.InterviewResponse;
import com.jobportal.security.UserDetailsImpl;
import com.jobportal.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Slf4j
public class InterviewController {

    private final InterviewService interviewService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<InterviewResponse>> scheduleInterview(
            @Valid @RequestBody InterviewRequest request) {
        UUID recruiterId = getAuthenticatedUser().getId();
        log.info("Recruiter {} scheduling interview for application {}", recruiterId, request.getApplicationId());
        InterviewResponse response = interviewService.scheduleInterview(recruiterId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Interview scheduled successfully"));
    }

    @PatchMapping("/{interviewId}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<InterviewResponse>> updateStatus(
            @PathVariable UUID interviewId,
            @RequestParam String status) {
        UUID recruiterId = getAuthenticatedUser().getId();
        log.info("Recruiter {} updating status of interview {} to {}", recruiterId, interviewId, status);
        InterviewResponse response = interviewService.updateInterviewStatus(recruiterId, interviewId, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Interview status updated successfully"));
    }

    @GetMapping("/my-interviews")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getMyInterviews() {
        UserDetailsImpl principal = getAuthenticatedUser();
        UUID userId = principal.getId();
        String role = principal.getAuthorities().iterator().next().getAuthority();

        log.info("Fetching interviews for user: {} with role: {}", userId, role);
        List<InterviewResponse> responses;
        if (role.equals("ROLE_RECRUITER")) {
            responses = interviewService.getInterviewsForRecruiter(userId);
        } else {
            responses = interviewService.getInterviewsForCandidate(userId);
        }

        return ResponseEntity.ok(ApiResponse.success(responses, "Interviews retrieved successfully"));
    }
}
