package com.jobportal.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class ApplicationRequest {
    private String coverLetter;
    private UUID resumeId; // Optional. If null, the latest uploaded resume will be used.
}
