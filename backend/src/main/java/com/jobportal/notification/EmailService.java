package com.jobportal.notification;

public interface EmailService {
    void sendVerificationOtp(String to, String otp);
    void sendPasswordResetOtp(String to, String otp);
    void sendInterviewScheduledEmail(String to, String candidateName, String jobTitle, String dateTime, String link);
    void sendApplicationStatusUpdate(String to, String candidateName, String jobTitle, String status);
}
