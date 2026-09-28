package com.jobportal.service;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.dto.JobSearchFilter;
import com.jobportal.entity.Job;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface JobService {
    JobResponse createJob(UUID recruiterId, UUID companyId, JobRequest request);
    JobResponse updateJob(UUID recruiterId, UUID jobId, JobRequest request);
    void deleteJob(UUID recruiterId, UUID jobId);
    JobResponse getJobResponseById(UUID jobId);
    Job getJobById(UUID jobId);
    Page<JobResponse> searchJobs(JobSearchFilter filter, int page, int size, String sortBy, String sortDir);
    JobResponse toggleJobActiveStatus(UUID recruiterId, UUID jobId, boolean isActive);
    List<JobResponse> getRecommendedJobs(UUID userId);
}
