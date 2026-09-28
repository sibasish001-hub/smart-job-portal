package com.jobportal.service;

import com.jobportal.dto.InterviewRequest;
import com.jobportal.dto.InterviewResponse;
import com.jobportal.entity.*;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.notification.EmailService;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final EmailService emailService;

    private InterviewResponse mapToResponse(Interview interview) {
        String candidateName = "";
        String candidateEmail = "";
        String recruiterName = "";

        if (interview.getCandidate() != null) {
            candidateEmail = interview.getCandidate().getEmail();
            if (interview.getCandidate().getProfile() != null) {
                candidateName = interview.getCandidate().getProfile().getFirstName() + " " +
                        interview.getCandidate().getProfile().getLastName();
            }
        }

        if (interview.getRecruiter() != null && interview.getRecruiter().getProfile() != null) {
            recruiterName = interview.getRecruiter().getProfile().getFirstName() + " " +
                    interview.getRecruiter().getProfile().getLastName();
        }

        return InterviewResponse.builder()
                .id(interview.getId())
                .applicationId(interview.getApplication().getId())
                .jobTitle(interview.getApplication().getJob().getTitle())
                .candidateName(candidateName)
                .candidateEmail(candidateEmail)
                .recruiterName(recruiterName)
                .interviewDate(interview.getInterviewDate())
                .locationOrLink(interview.getLocationOrLink())
                .status(interview.getStatus())
                .notes(interview.getNotes())
                .build();
    }

    @Override
    @Transactional
    public InterviewResponse scheduleInterview(UUID recruiterId, InterviewRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getJob().getCompany().getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You do not have permission to schedule interviews for this application");
        }

        // Create Interview record
        Interview interview = Interview.builder()
                .application(application)
                .recruiter(application.getJob().getCompany().getRecruiter())
                .candidate(application.getCandidate())
                .interviewDate(request.getInterviewDate())
                .locationOrLink(request.getLocationOrLink())
                .status("SCHEDULED")
                .notes(request.getNotes())
                .build();

        interview = interviewRepository.save(interview);

        // Update application status to INTERVIEWING
        application.setStatus("INTERVIEWING");
        applicationRepository.save(application);

        log.info("Interview scheduled: {} for application: {}", interview.getId(), application.getId());

        // Send email notification to candidate
        String candidateEmail = application.getCandidate().getEmail();
        String candidateName = "";
        if (application.getCandidate().getProfile() != null) {
            candidateName = application.getCandidate().getProfile().getFirstName() + " " +
                    application.getCandidate().getProfile().getLastName();
        }
        String dateTimeStr = request.getInterviewDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        emailService.sendInterviewScheduledEmail(
                candidateEmail,
                candidateName,
                application.getJob().getTitle(),
                dateTimeStr,
                request.getLocationOrLink()
        );

        return mapToResponse(interview);
    }

    @Override
    @Transactional
    public InterviewResponse updateInterviewStatus(UUID recruiterId, UUID interviewId, String status) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You do not have permission to modify this interview");
        }

        interview.setStatus(status.toUpperCase());
        interview = interviewRepository.save(interview);
        log.info("Interview {} status set to: {}", interviewId, status);
        return mapToResponse(interview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsForCandidate(UUID candidateId) {
        return interviewRepository.findByCandidateIdOrderByInterviewDateAsc(candidateId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsForRecruiter(UUID recruiterId) {
        return interviewRepository.findByRecruiterIdOrderByInterviewDateAsc(recruiterId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
