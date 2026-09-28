package com.jobportal.controller;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.ApplicationRequest;
import com.jobportal.dto.ApplicationResponse;
import com.jobportal.security.UserDetailsImpl;
import com.jobportal.service.ApplicationService;
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
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Slf4j
public class ApplicationController {

    private final ApplicationService applicationService;

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyForJob(
            @PathVariable UUID jobId,
            @RequestBody ApplicationRequest request) {
        UUID candidateId = getAuthenticatedUserId();
        log.info("Job seeker {} applying for job {}", candidateId, jobId);
        ApplicationResponse response = applicationService.applyForJob(candidateId, jobId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Application submitted successfully"));
    }

    @PatchMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable UUID applicationId,
            @RequestParam String status) {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Recruiter {} updating application {} status to: {}", recruiterId, applicationId, status);
        ApplicationResponse response = applicationService.updateApplicationStatus(recruiterId, applicationId, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Application status updated successfully"));
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications() {
        UUID candidateId = getAuthenticatedUserId();
        log.info("Fetching application list for candidate: {}", candidateId);
        List<ApplicationResponse> responses = applicationService.getApplicationsByCandidate(candidateId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Candidate applications retrieved successfully"));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getJobApplications(@PathVariable UUID jobId) {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Recruiter {} fetching application list for job: {}", recruiterId, jobId);
        List<ApplicationResponse> responses = applicationService.getApplicationsByJob(recruiterId, jobId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Job applications retrieved successfully"));
    }

    @GetMapping("/recruiter/all")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getRecruiterAllApplications() {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Recruiter {} fetching all received applications", recruiterId);
        List<ApplicationResponse> responses = applicationService.getApplicationsForRecruiter(recruiterId);
        return ResponseEntity.ok(ApiResponse.success(responses, "All recruiter applications retrieved successfully"));
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationDetails(@PathVariable UUID applicationId) {
        UUID userId = getAuthenticatedUserId();
        log.info("User {} fetching application details for {}", userId, applicationId);
        ApplicationResponse response = applicationService.getApplicationDetails(applicationId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Application details retrieved successfully"));
    }
}
