package com.jobportal.service;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.dto.JobSearchFilter;
import com.jobportal.entity.Company;
import com.jobportal.entity.Job;
import com.jobportal.entity.ResumeAnalysis;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.ResumeAnalysisRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;

    private JobResponse mapToResponse(Job job) {
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

    @Override
    @Transactional
    public JobResponse createJob(UUID recruiterId, UUID companyId, JobRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (!company.getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You do not have permission to post jobs for this company");
        }

        Job job = Job.builder()
                .company(company)
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .skillsRequired(request.getSkillsRequired())
                .location(request.getLocation())
                .remoteType(request.getRemoteType())
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .salaryRange(request.getSalaryRange())
                .isActive(true)
                .build();

        job = jobRepository.save(job);
        log.info("Job posted: {} by recruiter {} for company {}", job.getTitle(), recruiterId, company.getName());
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public JobResponse updateJob(UUID recruiterId, UUID jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getCompany().getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You do not have permission to modify this job");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setSkillsRequired(request.getSkillsRequired());
        job.setLocation(request.getLocation());
        job.setRemoteType(request.getRemoteType());
        job.setJobType(request.getJobType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setSalaryRange(request.getSalaryRange());

        job = jobRepository.save(job);
        log.info("Job updated: {}", job.getTitle());
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public void deleteJob(UUID recruiterId, UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getCompany().getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You do not have permission to delete this job");
        }

        jobRepository.delete(job);
        log.info("Job deleted, ID: {}", jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobResponseById(UUID jobId) {
        return mapToResponse(getJobById(jobId));
    }

    @Override
    @Transactional(readOnly = true)
    public Job getJobById(UUID jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(JobSearchFilter filter, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Job> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only show active jobs in search results
            predicates.add(cb.isTrue(root.get("isActive")));

            if (filter.getQuery() != null && !filter.getQuery().trim().isEmpty()) {
                String term = "%" + filter.getQuery().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), term);
                Predicate descLike = cb.like(cb.lower(root.get("description")), term);
                predicates.add(cb.or(titleLike, descLike));
            }

            if (filter.getLocation() != null && !filter.getLocation().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + filter.getLocation().toLowerCase() + "%"));
            }

            if (filter.getRemoteType() != null && !filter.getRemoteType().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("remoteType"), filter.getRemoteType()));
            }

            if (filter.getJobType() != null && !filter.getJobType().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("jobType"), filter.getJobType()));
            }

            if (filter.getExperienceLevel() != null && !filter.getExperienceLevel().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("experienceLevel"), filter.getExperienceLevel()));
            }

            if (filter.getSkillsRequired() != null && !filter.getSkillsRequired().trim().isEmpty()) {
                String skillTerm = "%" + filter.getSkillsRequired().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("skillsRequired")), skillTerm));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Job> jobPage = jobRepository.findAll(spec, pageable);
        return jobPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public JobResponse toggleJobActiveStatus(UUID recruiterId, UUID jobId, boolean isActive) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getCompany().getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You do not have permission to manage this job status");
        }

        job.setActive(isActive);
        job = jobRepository.save(job);
        log.info("Job {} active status set to: {}", jobId, isActive);
        return mapToResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getRecommendedJobs(UUID userId) {
        // Find latest resume analysis to extract the user's skills
        Optional<ResumeAnalysis> analysisOpt = resumeAnalysisRepository.findFirstByResumeUserIdOrderByCreatedAtDesc(userId);

        if (analysisOpt.isEmpty()) {
            // No resume yet — return the 20 most recent active jobs as a fallback
            log.info("No resume analysis found for user {}, returning recent jobs.", userId);
            return jobRepository.findAll(
                    (root, query, cb) -> cb.isTrue(root.get("isActive")),
                    PageRequest.of(0, 20, Sort.by("createdAt").descending())
            ).stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        ResumeAnalysis analysis = analysisOpt.get();

        // Build skill keywords from strengths + missing skills combined with skills from job seeker profile
        String skillsText = buildSkillKeywords(analysis);

        if (skillsText.isBlank()) {
            // Skills couldn't be parsed — return recent jobs
            return jobRepository.findAll(
                    (root, query, cb) -> cb.isTrue(root.get("isActive")),
                    PageRequest.of(0, 20, Sort.by("createdAt").descending())
            ).stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        // Search for active jobs that match any of the extracted skill keywords
        List<String> skills = Arrays.stream(skillsText.split("[,;\\s]+"))
                .map(String::trim)
                .filter(s -> s.length() > 2)
                .distinct()
                .limit(10)
                .collect(Collectors.toList());

        log.info("Recommending jobs for user {} based on skills: {}", userId, skills);

        Specification<Job> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            // Build OR predicate: job skillsRequired LIKE any skill keyword
            List<Predicate> skillPredicates = skills.stream()
                    .map(skill -> cb.like(cb.lower(root.get("skillsRequired")), "%" + skill.toLowerCase() + "%"))
                    .collect(Collectors.toList());

            if (!skillPredicates.isEmpty()) {
                predicates.add(cb.or(skillPredicates.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Job> matchingJobs = jobRepository.findAll(spec,
                PageRequest.of(0, 20, Sort.by("createdAt").descending())).getContent();
                
        // If no jobs perfectly matched the specific skills, fallback to returning recent jobs
        if (matchingJobs.isEmpty()) {
            log.info("No exact skill matches found for user {}, falling back to recent jobs", userId);
            matchingJobs = jobRepository.findAll(
                    (root, query, cb) -> cb.isTrue(root.get("isActive")),
                    PageRequest.of(0, 20, Sort.by("createdAt").descending())
            ).getContent();
        }

        // Sort by number of matched skills (descending) to put best matches first
        return matchingJobs.stream()
                .sorted((a, b) -> countMatches(b.getSkillsRequired(), skills) - countMatches(a.getSkillsRequired(), skills))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Extracts and cleans skill keywords from a resume analysis object. */
    private String buildSkillKeywords(ResumeAnalysis analysis) {
        StringBuilder sb = new StringBuilder();
        // Prefer strengths and missing skills as they tend to have skill names
        if (analysis.getStrengths() != null) sb.append(analysis.getStrengths()).append(" ");
        if (analysis.getMissingSkills() != null) sb.append(analysis.getMissingSkills()).append(" ");
        
        // Clean markdown and non-alphanumeric chars
        String cleaned = sb.toString().replaceAll("[^a-zA-Z0-9\\s]", " ").toLowerCase();
        
        // Remove common english words that might end up in the analysis text
        List<String> stopWords = Arrays.asList(
            "key", "detected", "skills", "clear", "formatting", "the", "document", "is", "structured", 
            "logically", "solid", "foundational", "resume", "details", "experience", "working", 
            "with", "technologies", "that", "form", "a", "robust", "stack", "layout", "partitioned", 
            "into", "legible", "fields", "covering", "education", "and", "chronological", "your", 
            "experiences", "are", "organized", "by", "timeline", "impact", "description", "lack", 
            "bullet", "points", "list", "responsibilities", "rather", "than", "metrics", "or", 
            "outcomes", "eg", "performance", "indicators", "devops", "gaps", "little", "no", 
            "mention", "containerization", "cloud", "deployments", "add", "quantified", "items", 
            "reduced", "latency", "instead", "wrote", "backend", "service", "include", "dedicated", 
            "projects", "section", "summarizing", "open", "source", "contributions", "notable", 
            "system", "builds", "highlight", "explicitly", "in", "missing", "improvements"
        );
        
        return Arrays.stream(cleaned.split("\\s+"))
            .filter(w -> w.length() > 2 && !stopWords.contains(w))
            .collect(Collectors.joining(" "));
    }

    /** Counts how many skill keywords appear in a job's skills string. */
    private int countMatches(String jobSkills, List<String> userSkills) {
        if (jobSkills == null || jobSkills.isBlank()) return 0;
        String lc = jobSkills.toLowerCase();
        return (int) userSkills.stream().filter(s -> lc.contains(s.toLowerCase())).count();
    }
}
