package com.jobportal.controller;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.ResumeAnalysisDto;
import com.jobportal.dto.ResumeDto;
import com.jobportal.entity.Resume;
import com.jobportal.entity.ResumeAnalysis;
import com.jobportal.security.UserDetailsImpl;
import com.jobportal.service.ResumeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Slf4j
public class ResumeController {

    private final ResumeService resumeService;

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    private ResumeDto mapToResumeDto(Resume resume) {
        return ResumeDto.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .createdAt(resume.getCreatedAt())
                .build();
    }

    private ResumeAnalysisDto mapToAnalysisDto(ResumeAnalysis analysis) {
        return ResumeAnalysisDto.builder()
                .id(analysis.getId())
                .resumeId(analysis.getResume().getId())
                .atsScore(analysis.getAtsScore())
                .strengths(analysis.getStrengths())
                .weaknesses(analysis.getWeaknesses())
                .missingSkills(analysis.getMissingSkills())
                .improvements(analysis.getImprovements())
                .suggestedCertifications(analysis.getSuggestedCertifications())
                .careerPath(analysis.getCareerPath())
                .createdAt(analysis.getCreatedAt())
                .build();
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ResumeDto>> uploadResume(@RequestParam("file") MultipartFile file) {
        UUID userId = getAuthenticatedUserId();
        log.info("Uploading resume for user: {}", userId);
        Resume resume = resumeService.uploadAndAnalyzeResume(userId, file);
        return ResponseEntity.ok(ApiResponse.success(mapToResumeDto(resume), "Resume uploaded and analyzed successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeDto>>> getResumes() {
        UUID userId = getAuthenticatedUserId();
        log.info("Fetching resumes for user: {}", userId);
        List<Resume> resumes = resumeService.getResumesByUser(userId);
        List<ResumeDto> dtos = resumes.stream().map(this::mapToResumeDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Resumes fetched successfully"));
    }

    @GetMapping("/{resumeId}/download")
    public ResponseEntity<Resource> downloadResume(@PathVariable UUID resumeId) {
        UUID userId = getAuthenticatedUserId();
        log.info("Downloading resume: {} for user: {}", resumeId, userId);
        Resume resume = resumeService.getResumeById(resumeId, userId);
        Resource resource = resumeService.downloadResumeFile(resumeId, userId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resume.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/latest-analysis")
    public ResponseEntity<ApiResponse<ResumeAnalysisDto>> getLatestAnalysis() {
        UUID userId = getAuthenticatedUserId();
        log.info("Fetching latest resume analysis for user: {}", userId);
        ResumeAnalysis analysis = resumeService.getLatestAnalysisForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(mapToAnalysisDto(analysis), "Latest analysis fetched successfully"));
    }

    @GetMapping("/{resumeId}/analysis")
    public ResponseEntity<ApiResponse<ResumeAnalysisDto>> getAnalysisByResume(@PathVariable UUID resumeId) {
        UUID userId = getAuthenticatedUserId();
        log.info("Fetching analysis for resume: {} and user: {}", resumeId, userId);
        ResumeAnalysis analysis = resumeService.getAnalysisByResumeId(resumeId, userId);
        return ResponseEntity.ok(ApiResponse.success(mapToAnalysisDto(analysis), "Analysis fetched successfully"));
    }
}
