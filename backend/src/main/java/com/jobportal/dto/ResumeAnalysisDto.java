package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysisDto {
    private UUID id;
    private UUID resumeId;
    private int atsScore;
    private String strengths;
    private String weaknesses;
    private String missingSkills;
    private String improvements;
    private String suggestedCertifications;
    private String careerPath;
    private LocalDateTime createdAt;
}
