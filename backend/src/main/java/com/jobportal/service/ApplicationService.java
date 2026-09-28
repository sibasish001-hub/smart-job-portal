package com.jobportal.service;

import com.jobportal.dto.ApplicationRequest;
import com.jobportal.dto.ApplicationResponse;

import java.util.List;
import java.util.UUID;

public interface ApplicationService {
    ApplicationResponse applyForJob(UUID candidateId, UUID jobId, ApplicationRequest request);
    ApplicationResponse updateApplicationStatus(UUID recruiterId, UUID applicationId, String status);
    List<ApplicationResponse> getApplicationsByCandidate(UUID candidateId);
    List<ApplicationResponse> getApplicationsByJob(UUID recruiterId, UUID jobId);
    ApplicationResponse getApplicationDetails(UUID applicationId, UUID userId);
    List<ApplicationResponse> getApplicationsForRecruiter(UUID recruiterId);
}
