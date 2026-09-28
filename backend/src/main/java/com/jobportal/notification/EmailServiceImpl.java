package com.jobportal.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    @Async
    public void sendVerificationOtp(String to, String otp) {
        log.info("[EMAIL OTP] sending verification OTP to {}: {}", to, otp);
        System.out.println("=================================================");
        System.out.printf("[DEVELOPER NOTICE] Email verification OTP for %s is: %s%n", to, otp);
        System.out.println("=================================================");
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@smartjobportal.com");
            message.setTo(to);
            message.setSubject("Smart Job Portal - Verify your Email");
            message.setText("Welcome to Smart Job Portal! Your verification OTP is: " + otp + 
                    "\nIt is valid for 15 minutes.");
            mailSender.send(message);
            log.info("Verification email successfully sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to {} via SMTP: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendPasswordResetOtp(String to, String otp) {
        log.info("[EMAIL OTP] sending password reset OTP to {}: {}", to, otp);
        System.out.println("=================================================");
        System.out.printf("[DEVELOPER NOTICE] Password reset OTP for %s is: %s%n", to, otp);
        System.out.println("=================================================");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@smartjobportal.com");
            message.setTo(to);
            message.setSubject("Smart Job Portal - Password Reset OTP");
            message.setText("Your OTP to reset password is: " + otp + 
                    "\nIt is valid for 15 minutes. If you did not request this, please ignore this email.");
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {} via SMTP: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendInterviewScheduledEmail(String to, String candidateName, String jobTitle, String dateTime, String link) {
        log.info("[EMAIL NOTIFICATION] sending interview scheduled to {}: Candidate: {}, Job: {}, Date: {}", 
                to, candidateName, jobTitle, dateTime);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("recruiting@smartjobportal.com");
            message.setTo(to);
            message.setSubject("Interview Scheduled - " + jobTitle);
            message.setText(String.format("Hi %s,\n\nAn interview has been scheduled for the role: %s.\nDate/Time: %s\nJoin Link / Location: %s\n\nBest regards,\nRecruiting Team", 
                    candidateName, jobTitle, dateTime, link));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send interview email to {} via SMTP: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendApplicationStatusUpdate(String to, String candidateName, String jobTitle, String status) {
        log.info("[EMAIL NOTIFICATION] sending application status update to {}: Job: {}, Status: {}", 
                to, jobTitle, status);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("recruiting@smartjobportal.com");
            message.setTo(to);
            message.setSubject("Application Status Update - " + jobTitle);
            message.setText(String.format("Hi %s,\n\nThe status of your application for the role: %s has been updated to: %s.\n\nBest regards,\nRecruiting Team", 
                    candidateName, jobTitle, status));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send application status update to {} via SMTP: {}", to, e.getMessage());
        }
    }
}
