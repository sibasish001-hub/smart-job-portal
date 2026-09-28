package com.jobportal.service;

import com.jobportal.dto.*;

public interface AuthService {
    String register(RegisterRequest request);
    JwtResponse login(LoginRequest request);
    JwtResponse verifyOtp(VerifyOtpRequest request);
    JwtResponse refreshToken(RefreshTokenRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
