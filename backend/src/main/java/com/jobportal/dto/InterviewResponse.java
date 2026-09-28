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
public class InterviewResponse {
    private UUID id;
    private UUID applicationId;
    private String jobTitle;
    private String candidateName;
    private String candidateEmail;
    private String recruiterName;
    private LocalDateTime interviewDate;
    private String locationOrLink;
    private String status;
    private String notes;
}
