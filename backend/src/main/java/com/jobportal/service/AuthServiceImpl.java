package com.jobportal.service;

import com.jobportal.dto.*;
import com.jobportal.entity.Profile;
import com.jobportal.entity.User;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.notification.EmailService;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtUtils;
import com.jobportal.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    private String generateOtp() {
        return String.format("%06d", secureRandom.nextInt(1000000));
    }

    @Override
    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already in use");
        }

        String otp = generateOtp();
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isVerified(false)
                .verificationOtp(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(15))
                .build();

        Profile profile = Profile.builder()
                .user(user)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        user.setProfile(profile);
        userRepository.save(user);

        emailService.sendVerificationOtp(user.getEmail(), otp);

        return "User registered successfully. Please check your email for the verification code.";
    }

    @Override
    @Transactional
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isVerified()) {
            throw new BadRequestException("Please verify your email address before logging in.");
        }

        String accessToken = jwtUtils.generateAccessToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        String firstName = "";
        String lastName = "";
        if (user.getProfile() != null) {
            firstName = user.getProfile().getFirstName();
            lastName = user.getProfile().getLastName();
        }

        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isVerified(user.isVerified())
                .firstName(firstName)
                .lastName(lastName)
                .build();
    }

    @Override
    @Transactional
    public JwtResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.isVerified()) {
            throw new BadRequestException("User is already verified");
        }

        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid verification OTP");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification OTP has expired");
        }

        user.setVerified(true);
        user.setVerificationOtp(null);
        user.setOtpExpiry(null);

        // Generate tokens immediately so user is auto-logged-in after verification
        String accessToken = jwtUtils.generateAccessToken(
                user.getEmail(),
                "ROLE_" + user.getRole().name(),
                user.getId().toString()
        );
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        String firstName = "";
        String lastName = "";
        if (user.getProfile() != null) {
            firstName = user.getProfile().getFirstName() != null ? user.getProfile().getFirstName() : "";
            lastName = user.getProfile().getLastName() != null ? user.getProfile().getLastName() : "";
        }

        log.info("User verified and auto-logged in: {}", user.getEmail());

        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isVerified(true)
                .firstName(firstName)
                .lastName(lastName)
                .build();
    }

    @Override
    @Transactional
    public JwtResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!jwtUtils.validateJwtToken(token)) {
            throw new BadRequestException("Invalid refresh token");
        }

        User user = userRepository.findByRefreshToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token or token not found"));

        String email = jwtUtils.getEmailFromJwtToken(token);
        if (!user.getEmail().equals(email)) {
            throw new BadRequestException("Token email mismatch");
        }

        String newAccessToken = jwtUtils.generateAccessToken(
                user.getEmail(),
                "ROLE_" + user.getRole().name(),
                user.getId().toString()
        );
        String newRefreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        String firstName = "";
        String lastName = "";
        if (user.getProfile() != null) {
            firstName = user.getProfile().getFirstName();
            lastName = user.getProfile().getLastName();
        }

        return JwtResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isVerified(user.isVerified())
                .firstName(firstName)
                .lastName(lastName)
                .build();
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String otp = generateOtp();
        user.setVerificationOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordResetOtp(user.getEmail(), otp);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid reset OTP");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset OTP has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setVerificationOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }
}
