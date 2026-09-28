package com.jobportal.service;

import com.jobportal.dto.DashboardDto;
import com.jobportal.dto.NotificationDto;

import java.util.List;
import java.util.UUID;

public interface DashboardService {
    DashboardDto.SeekerDashboard getSeekerDashboard(UUID seekerId);
    DashboardDto.RecruiterDashboard getRecruiterDashboard(UUID recruiterId);
    DashboardDto.AdminDashboard getAdminDashboard();

    // Notifications
    List<NotificationDto> getNotifications(UUID userId);
    NotificationDto markNotificationRead(UUID userId, UUID notificationId);
    void markAllNotificationsRead(UUID userId);

    // Saved Jobs
    void saveJob(UUID userId, UUID jobId);
    void unsaveJob(UUID userId, UUID jobId);
    boolean isJobSaved(UUID userId, UUID jobId);
    List<Object> getSavedJobs(UUID userId);
}
