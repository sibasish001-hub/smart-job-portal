package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Dashboard DTOs

public class DashboardDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeekerDashboard {
        private int atsScore;
        private long totalApplications;
        private long savedJobsCount;
        private long upcomingInterviews;
        private List<ApplicationResponse> recentApplications;
        private List<InterviewResponse> upcomingInterviewList;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecruiterDashboard {
        private long activeJobsCount;
        private long totalApplicants;
        private long scheduledInterviews;
        private List<JobResponse> recentJobs;
        private List<ApplicationResponse> recentApplications;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminDashboard {
        private long totalUsers;
        private long totalRecruiters;
        private long totalJobSeekers;
        private long totalJobsPosted;
        private long totalApplications;
    }
}
