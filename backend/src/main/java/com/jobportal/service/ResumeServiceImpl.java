package com.jobportal.service;

import com.jobportal.dto.ResumeAnalysisResponse;
import com.jobportal.entity.Resume;
import com.jobportal.entity.ResumeAnalysis;
import com.jobportal.entity.User;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.ResumeAnalysisRepository;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.storage.StorageService;
import com.jobportal.util.ResumeParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeServiceImpl implements ResumeService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final StorageService storageService;
    private final ResumeParser resumeParser;
    private final AiService aiService;

    @Override
    @Transactional
    public Resume uploadAndAnalyzeResume(UUID userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        log.info("Starting upload and analysis of resume: {} for user: {}", file.getOriginalFilename(), userId);

        // 1. Extract plain text content from PDF/DOCX
        String parsedText = resumeParser.parse(file);

        // 2. Persist the file physically to local store
        String storedPath = storageService.store(file, "resumes/" + userId.toString());

        // 3. Save Resume metadata in database
        Resume resume = Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .fileUrl(storedPath)
                .parsedText(parsedText)
                .build();
        
        resume = resumeRepository.save(resume);
        log.info("Saved resume metadata, ID: {}", resume.getId());

        // 4. Request AI Analysis
        log.info("Invoking AI parsing analysis on extracted text (length: {})", parsedText.length());
        ResumeAnalysisResponse aiResponse = aiService.analyzeResume(parsedText);

        // 5. Store AI Analysis results in database
        ResumeAnalysis analysis = ResumeAnalysis.builder()
                .resume(resume)
                .atsScore(aiResponse.getAtsScore())
                .strengths(aiResponse.getStrengths())
                .weaknesses(aiResponse.getWeaknesses())
                .missingSkills(aiResponse.getMissingSkills())
                .improvements(aiResponse.getImprovements())
                .suggestedCertifications(aiResponse.getSuggestedCertifications())
                .careerPath(aiResponse.getCareerPath())
                .build();

        resumeAnalysisRepository.save(analysis);
        log.info("Saved resume analysis successfully, ATS Score: {}", analysis.getAtsScore());

        return resume;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Resume> getResumesByUser(UUID userId) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Resume getResumeById(UUID resumeId, UUID userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (!resume.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to view this resume");
        }

        return resume;
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadResumeFile(UUID resumeId, UUID userId) {
        Resume resume = getResumeById(resumeId, userId);
        return storageService.loadAsResource(resume.getFileUrl());
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeAnalysis getLatestAnalysisForUser(UUID userId) {
        return resumeAnalysisRepository.findFirstByResumeUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No resume analysis found for user. Please upload a resume first."));
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeAnalysis getAnalysisByResumeId(UUID resumeId, UUID userId) {
        Resume resume = getResumeById(resumeId, userId);
        return resumeAnalysisRepository.findFirstByResumeIdOrderByCreatedAtDesc(resume.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No analysis found for this resume."));
    }
}
