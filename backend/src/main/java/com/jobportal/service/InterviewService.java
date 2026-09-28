package com.jobportal.service;

import com.jobportal.dto.InterviewRequest;
import com.jobportal.dto.InterviewResponse;

import java.util.List;
import java.util.UUID;

public interface InterviewService {
    InterviewResponse scheduleInterview(UUID recruiterId, InterviewRequest request);
    InterviewResponse updateInterviewStatus(UUID recruiterId, UUID interviewId, String status);
    List<InterviewResponse> getInterviewsForCandidate(UUID candidateId);
    List<InterviewResponse> getInterviewsForRecruiter(UUID recruiterId);
}
