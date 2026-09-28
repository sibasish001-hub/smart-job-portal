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
public class ApplicationResponse {
    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private String companyName;
    private UUID candidateId;
    private String candidateName;
    private String candidateEmail;
    private UUID resumeId;
    private String resumeName;
    private String status;
    private String coverLetter;
    private int aiMatchScore;
    private String aiMatchDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
