package com.jobportal.service;

import com.jobportal.dto.ApplicationResponse;
import com.jobportal.dto.DashboardDto;
import com.jobportal.dto.InterviewResponse;
import com.jobportal.dto.JobResponse;
import com.jobportal.dto.NotificationDto;
import com.jobportal.entity.*;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.*;
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
public class DashboardServiceImpl implements DashboardService {

    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final SavedJobRepository savedJobRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    // ─── Dashboard Stats ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public DashboardDto.SeekerDashboard getSeekerDashboard(UUID seekerId) {
        int atsScore = resumeAnalysisRepository
                .findFirstByResumeUserIdOrderByCreatedAtDesc(seekerId)
                .map(ResumeAnalysis::getAtsScore)
                .orElse(0);

        long totalApplications = applicationRepository.findByCandidateIdOrderByCreatedAtDesc(seekerId).size();
        long savedJobs = savedJobRepository.countByUserId(seekerId);
        long upcomingInterviews = interviewRepository
                .findByCandidateIdOrderByInterviewDateAsc(seekerId)
                .stream()
                .filter(i -> i.getStatus().equals("SCHEDULED"))
                .count();

        List<ApplicationResponse> recentApps = applicationRepository
                .findByCandidateIdOrderByCreatedAtDesc(seekerId)
                .stream().limit(5)
                .map(this::mapApp)
                .collect(Collectors.toList());

        List<InterviewResponse> upcomingList = interviewRepository
                .findByCandidateIdOrderByInterviewDateAsc(seekerId)
                .stream()
                .filter(i -> i.getStatus().equals("SCHEDULED"))
                .limit(3)
                .map(this::mapInterview)
                .collect(Collectors.toList());

        return DashboardDto.SeekerDashboard.builder()
                .atsScore(atsScore)
                .totalApplications(totalApplications)
                .savedJobsCount(savedJobs)
                .upcomingInterviews(upcomingInterviews)
                .recentApplications(recentApps)
                .upcomingInterviewList(upcomingList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardDto.RecruiterDashboard getRecruiterDashboard(UUID recruiterId) {
        long activeJobs = jobRepository.findAll().stream()
                .filter(j -> j.getCompany().getRecruiter().getId().equals(recruiterId) && j.isActive())
                .count();

        long totalApplicants = applicationRepository.countByJobCompanyRecruiterId(recruiterId);

        long scheduledInterviews = interviewRepository
                .findByRecruiterIdOrderByInterviewDateAsc(recruiterId)
                .stream()
                .filter(i -> i.getStatus().equals("SCHEDULED"))
                .count();

        List<JobResponse> recentJobs = jobRepository.findAll().stream()
                .filter(j -> j.getCompany().getRecruiter().getId().equals(recruiterId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(this::mapJob)
                .collect(Collectors.toList());

        List<ApplicationResponse> recentApps = applicationRepository
                .findByJobCompanyRecruiterId(recruiterId)
                .stream().limit(5)
                .map(this::mapApp)
                .collect(Collectors.toList());

        return DashboardDto.RecruiterDashboard.builder()
                .activeJobsCount(activeJobs)
                .totalApplicants(totalApplicants)
                .scheduledInterviews(scheduledInterviews)
                .recentJobs(recentJobs)
                .recentApplications(recentApps)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardDto.AdminDashboard getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalRecruiters = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.RECRUITER).count();
        long totalSeekers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.JOB_SEEKER).count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();

        return DashboardDto.AdminDashboard.builder()
                .totalUsers(totalUsers)
                .totalRecruiters(totalRecruiters)
                .totalJobSeekers(totalSeekers)
                .totalJobsPosted(totalJobs)
                .totalApplications(totalApplications)
                .build();
    }

    // ─── Notifications ──────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapNotification).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationDto markNotificationRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Not your notification");
        }
        notification.setRead(true);
        return mapNotification(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllNotificationsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !n.isRead()).collect(Collectors.toList());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    // ─── Saved Jobs ─────────────────────────────────────────────────

    @Override
    @Transactional
    public void saveJob(UUID userId, UUID jobId) {
        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new BadRequestException("Job is already saved");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        SavedJob savedJob = SavedJob.builder()
                .userId(userId)
                .jobId(jobId)
                .user(user)
                .job(job)
                .build();
        savedJobRepository.save(savedJob);
        log.info("User {} saved job {}", userId, jobId);
    }

    @Override
    @Transactional
    public void unsaveJob(UUID userId, UUID jobId) {
        if (!savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new BadRequestException("Job is not saved");
        }
        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
        log.info("User {} unsaved job {}", userId, jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isJobSaved(UUID userId, UUID jobId) {
        return savedJobRepository.existsByUserIdAndJobId(userId, jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object> getSavedJobs(UUID userId) {
        return savedJobRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(sj -> (Object) mapJob(sj.getJob()))
                .collect(Collectors.toList());
    }

    // ─── Mappers ────────────────────────────────────────────────────

    private NotificationDto mapNotification(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private JobResponse mapJob(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .companyId(job.getCompany().getId())
                .companyName(job.getCompany().getName())
                .companyLogoUrl(job.getCompany().getLogoUrl())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .skillsRequired(job.getSkillsRequired())
                .location(job.getLocation())
                .remoteType(job.getRemoteType())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .salaryRange(job.getSalaryRange())
                .isActive(job.isActive())
                .createdAt(job.getCreatedAt())
                .build();
    }

    private ApplicationResponse mapApp(Application app) {
        String candidateName = "";
        String candidateEmail = app.getCandidate().getEmail();
        if (app.getCandidate().getProfile() != null) {
            candidateName = app.getCandidate().getProfile().getFirstName() + " "
                    + app.getCandidate().getProfile().getLastName();
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

    private InterviewResponse mapInterview(Interview i) {
        String candidateName = "";
        String candidateEmail = i.getCandidate().getEmail();
        if (i.getCandidate().getProfile() != null) {
            candidateName = i.getCandidate().getProfile().getFirstName() + " "
                    + i.getCandidate().getProfile().getLastName();
        }
        String recruiterName = "";
        if (i.getRecruiter().getProfile() != null) {
            recruiterName = i.getRecruiter().getProfile().getFirstName() + " "
                    + i.getRecruiter().getProfile().getLastName();
        }
        return InterviewResponse.builder()
                .id(i.getId())
                .applicationId(i.getApplication().getId())
                .jobTitle(i.getApplication().getJob().getTitle())
                .candidateName(candidateName)
                .candidateEmail(candidateEmail)
                .recruiterName(recruiterName)
                .interviewDate(i.getInterviewDate())
                .locationOrLink(i.getLocationOrLink())
                .status(i.getStatus())
                .notes(i.getNotes())
                .build();
    }
}
