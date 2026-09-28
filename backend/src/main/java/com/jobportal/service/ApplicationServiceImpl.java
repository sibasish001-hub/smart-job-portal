package com.jobportal.service;

import com.jobportal.dto.ApplicationRequest;
import com.jobportal.dto.ApplicationResponse;
import com.jobportal.dto.JobMatchResponse;
import com.jobportal.entity.*;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.notification.EmailService;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final AiService aiService;
    private final EmailService emailService;

    private ApplicationResponse mapToResponse(Application app) {
        String candidateName = "";
        String candidateEmail = "";
        if (app.getCandidate() != null) {
            candidateEmail = app.getCandidate().getEmail();
            if (app.getCandidate().getProfile() != null) {
                candidateName = app.getCandidate().getProfile().getFirstName() + " " +
                        app.getCandidate().getProfile().getLastName();
            }
        }

        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .companyName(app.getJob().getCompany().getName())
                .candidateId(app.getCandidate().getId())
                .candidateName(candidateName)
                .candidateEmail(candidateEmail)
                .resumeId(app.getResume() != null ? app.getResume().getId() : null)
                .resumeName(app.getResume() != null ? app.getResume().getFileName() : "N/A")
                .status(app.getStatus())
                .coverLetter(app.getCoverLetter())
                .aiMatchScore(app.getAiMatchScore())
                .aiMatchDetails(app.getAiMatchDetails())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public ApplicationResponse applyForJob(UUID candidateId, UUID jobId, ApplicationRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.isActive()) {
            throw new BadRequestException("This job posting is no longer active");
        }

        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        if (candidate.getRole() != Role.JOB_SEEKER) {
            throw new AccessDeniedException("Only job seekers can apply for jobs");
        }

        if (applicationRepository.findByJobIdAndCandidateId(jobId, candidateId).isPresent()) {
            throw new BadRequestException("You have already applied for this job");
        }

        // Resolve Resume
        Resume resume;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
            if (!resume.getUser().getId().equals(candidateId)) {
                throw new AccessDeniedException("Invalid resume selection");
            }
        } else {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(candidateId);
            if (userResumes.isEmpty()) {
                throw new BadRequestException("Please upload a resume before applying to jobs.");
            }
            resume = userResumes.get(0); // select latest
        }

        // Create Application record
        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resume(resume)
                .coverLetter(request.getCoverLetter())
                .status("APPLIED")
                .build();

        application = applicationRepository.save(application);
        log.info("Job application stored. ID: {} for job: {}", application.getId(), jobId);

        // Perform AI match scoring
        log.info("Triggering AI job suitability scoring for application: {}", application.getId());
        try {
            JobMatchResponse matchResult = aiService.evaluateJobMatch(
                    resume.getParsedText(),
                    job.getDescription(),
                    job.getRequirements()
            );
            application.setAiMatchScore(matchResult.getMatchScore());
            application.setAiMatchDetails(matchResult.getMatchDetails());
            application = applicationRepository.save(application);
            log.info("AI match score evaluated successfully: {}", matchResult.getMatchScore());
        } catch (Exception e) {
            log.error("AI matchmaking evaluation failed. Proceeding with default values.", e);
        }

        return mapToResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(UUID recruiterId, UUID applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getJob().getCompany().getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You do not have permission to modify this application");
        }

        application.setStatus(status.toUpperCase());
        application = applicationRepository.save(application);
        log.info("Application {} status updated to: {}", applicationId, status);

        // Notify candidate of update
        String candidateEmail = application.getCandidate().getEmail();
        String candidateName = "";
        if (application.getCandidate().getProfile() != null) {
            candidateName = application.getCandidate().getProfile().getFirstName() + " " +
                    application.getCandidate().getProfile().getLastName();
        }
        
        emailService.sendApplicationStatusUpdate(
                candidateEmail,
                candidateName,
                application.getJob().getTitle(),
                status
        );

        return mapToResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByCandidate(UUID candidateId) {
        return applicationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByJob(UUID recruiterId, UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getCompany().getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You do not have permission to view applications for this job");
        }

        return applicationRepository.findByJobIdOrderByCreatedAtDesc(jobId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationDetails(UUID applicationId, UUID userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        boolean isCandidate = application.getCandidate().getId().equals(userId);
        boolean isRecruiter = application.getJob().getCompany().getRecruiter().getId().equals(userId);

        if (!isCandidate && !isRecruiter) {
            throw new AccessDeniedException("You do not have permission to view this application details");
        }

        return mapToResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForRecruiter(UUID recruiterId) {
        return applicationRepository.findByJobCompanyRecruiterId(recruiterId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
