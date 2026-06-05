package com.ubs.service;

import com.ubs.dto.request.*;
import com.ubs.dto.response.AuthResponse;
import com.ubs.dto.response.SignupResponse;

public interface AuthService {
    SignupResponse signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
    void verifyOtp(VerifyOtpRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
