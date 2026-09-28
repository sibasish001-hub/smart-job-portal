package com.jobportal.service;

import com.jobportal.entity.Resume;
import com.jobportal.entity.ResumeAnalysis;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ResumeService {
    Resume uploadAndAnalyzeResume(UUID userId, MultipartFile file);
    List<Resume> getResumesByUser(UUID userId);
    Resume getResumeById(UUID resumeId, UUID userId);
    Resource downloadResumeFile(UUID resumeId, UUID userId);
    ResumeAnalysis getLatestAnalysisForUser(UUID userId);
    ResumeAnalysis getAnalysisByResumeId(UUID resumeId, UUID userId);
}
