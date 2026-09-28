package com.jobportal.controller;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.dto.JobSearchFilter;
import com.jobportal.security.UserDetailsImpl;
import com.jobportal.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
public class JobController {

    private final JobService jobService;

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @RequestParam UUID companyId,
            @Valid @RequestBody JobRequest request) {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Recruiter {} creating job post for company {}", recruiterId, companyId);
        JobResponse response = jobService.createJob(recruiterId, companyId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Job posted successfully"));
    }

    @PutMapping("/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable UUID jobId,
            @Valid @RequestBody JobRequest request) {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Recruiter {} updating job {}", recruiterId, jobId);
        JobResponse response = jobService.updateJob(recruiterId, jobId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Job post updated successfully"));
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable UUID jobId) {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Recruiter {} deleting job {}", recruiterId, jobId);
        jobService.deleteJob(recruiterId, jobId);
        return ResponseEntity.ok(ApiResponse.success(null, "Job post deleted successfully"));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobResponse>> getJob(@PathVariable UUID jobId) {
        log.info("Fetching job detail for ID: {}", jobId);
        JobResponse response = jobService.getJobResponseById(jobId);
        return ResponseEntity.ok(ApiResponse.success(response, "Job detail retrieved successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> searchJobs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String remoteType,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String skillsRequired,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        JobSearchFilter filter = JobSearchFilter.builder()
                .query(query)
                .location(location)
                .remoteType(remoteType)
                .jobType(jobType)
                .experienceLevel(experienceLevel)
                .skillsRequired(skillsRequired)
                .build();

        log.info("Searching jobs with filters: {}, page: {}, size: {}", filter, page, size);
        Page<JobResponse> jobs = jobService.searchJobs(filter, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(jobs, "Jobs search completed successfully"));
    }

    @PatchMapping("/{jobId}/toggle-active")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> toggleJobActive(
            @PathVariable UUID jobId,
            @RequestParam boolean isActive) {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Recruiter {} changing active status of job {} to: {}", recruiterId, jobId, isActive);
        JobResponse response = jobService.toggleJobActiveStatus(recruiterId, jobId, isActive);
        return ResponseEntity.ok(ApiResponse.success(response, "Job active status updated"));
    }

    @GetMapping("/recommended")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getRecommendedJobs() {
        UUID userId = getAuthenticatedUserId();
        log.info("Fetching recommended jobs for user: {}", userId);
        List<JobResponse> jobs = jobService.getRecommendedJobs(userId);
        return ResponseEntity.ok(ApiResponse.success(jobs, "Recommended jobs retrieved successfully"));
    }
}
