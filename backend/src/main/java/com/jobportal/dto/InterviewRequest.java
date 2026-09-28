package com.jobportal.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class InterviewRequest {

    @NotNull(message = "Application ID is required")
    private UUID applicationId;

    @NotNull(message = "Interview date is required")
    @Future(message = "Interview date must be in the future")
    private LocalDateTime interviewDate;

    @NotBlank(message = "Location or join link is required")
    private String locationOrLink;

    private String notes;
}
