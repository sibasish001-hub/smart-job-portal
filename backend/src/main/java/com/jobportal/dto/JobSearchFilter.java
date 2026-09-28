package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSearchFilter {
    private String query;
    private String location;
    private String remoteType;
    private String jobType;
    private String experienceLevel;
    private String skillsRequired;
}
