package com.jobportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobRequest {

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    private String requirements;

    private String skillsRequired; // Comma-separated list

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Remote type is required (e.g. REMOTE, HYBRID, ONSITE)")
    private String remoteType;

    @NotBlank(message = "Job type is required (e.g. FULL_TIME, PART_TIME, CONTRACT)")
    private String jobType;

    @NotBlank(message = "Experience level is required (e.g. ENTRY, JUNIOR, MID, SENIOR, LEAD)")
    private String experienceLevel;

    private String salaryRange;
}
