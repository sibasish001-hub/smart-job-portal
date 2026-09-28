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
public class JobResponse {
    private UUID id;
    private UUID companyId;
    private String companyName;
    private String companyLogoUrl;
    private String title;
    private String description;
    private String requirements;
    private String skillsRequired;
    private String location;
    private String remoteType;
    private String jobType;
    private String experienceLevel;
    private String salaryRange;
    private boolean isActive;
    private LocalDateTime createdAt;
}
