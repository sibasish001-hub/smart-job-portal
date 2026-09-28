package com.jobportal.service;

import com.jobportal.dto.LoginRequest;
import com.jobportal.dto.RegisterRequest;
import com.jobportal.dto.VerifyOtpRequest;
import com.jobportal.entity.Profile;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.exception.BadRequestException;
import com.jobportal.notification.EmailService;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtUtils jwtUtils;
    @Mock EmailService emailService;

    @InjectMocks AuthServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .passwordHash("hashedpass")
                .role(Role.JOB_SEEKER)
                .isVerified(false)
                .verificationOtp("123456")
                .otpExpiry(LocalDateTime.now().plusMinutes(10))
                .build();

        Profile profile = Profile.builder()
                .user(testUser)
                .firstName("John")
                .lastName("Doe")
                .build();
        testUser.setProfile(profile);
    }

    @Test
    void register_NewUser_SendsOtpEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setRole(Role.JOB_SEEKER);
        request.setFirstName("Jane");
        request.setLastName("Smith");

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        String result = authService.register(request);

        assertTrue(result.contains("registered successfully"));
        verify(emailService, times(1)).sendVerificationOtp(eq("new@example.com"), anyString());
    }

    @Test
    void register_ExistingEmail_ThrowsBadRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");
        request.setRole(Role.JOB_SEEKER);
        request.setFirstName("John");
        request.setLastName("Doe");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    void verifyOtp_ValidOtp_SetsVerified() {
        testUser.setVerificationOtp("654321");
        testUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("test@example.com");
        request.setOtp("654321");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        when(jwtUtils.generateAccessToken(anyString(), anyString(), anyString())).thenReturn("mock-jwt-token");
        when(jwtUtils.generateRefreshToken(anyString())).thenReturn("mock-refresh-token");

        com.jobportal.dto.JwtResponse result = authService.verifyOtp(request);

        assertNotNull(result);
        assertEquals("mock-jwt-token", result.getAccessToken());
        assertTrue(testUser.isVerified());
        assertNull(testUser.getVerificationOtp());
    }

    @Test
    void verifyOtp_ExpiredOtp_ThrowsBadRequest() {
        testUser.setOtpExpiry(LocalDateTime.now().minusMinutes(1)); // expired

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("test@example.com");
        request.setOtp("123456");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(BadRequestException.class, () -> authService.verifyOtp(request));
    }

    @Test
    void verifyOtp_WrongOtp_ThrowsBadRequest() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("test@example.com");
        request.setOtp("000000");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(BadRequestException.class, () -> authService.verifyOtp(request));
    }
}
