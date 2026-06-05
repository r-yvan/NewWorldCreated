package com.ubs.service.impl;

import com.ubs.dto.request.*;
import com.ubs.dto.response.AuthResponse;
import com.ubs.dto.response.SignupResponse;
import com.ubs.entity.User;
import com.ubs.enums.OtpPurpose;
import com.ubs.enums.UserStatus;
import com.ubs.exception.ConflictException;
import com.ubs.exception.InactiveAccountException;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.mapper.UserMapper;
import com.ubs.repository.UserRepository;
import com.ubs.security.JwtService;
import com.ubs.service.OtpService;
import com.ubs.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final OtpService otpService;

    @Override
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }
        User user = User.builder()
                .fullNames(request.getFullNames())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(UserStatus.INACTIVE)
                .roles(Set.of(request.getRole()))
                .build();
        user = userRepository.save(user);
        otpService.generateAndSendOtp(user, OtpPurpose.ACCOUNT_VERIFICATION);
        log.info("User registered: {}", user.getEmail());
        return SignupResponse.builder()
                .message("User registered successfully. OTP sent for verification.")
                .userId(user.getId())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new InactiveAccountException("Inactive account");
        }
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String token = jwtService.generateToken(user);
        log.info("Login successful for {}", user.getEmail());
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs() / 1000)
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        otpService.validateOtp(user, request.getOtp(), request.getPurpose());
        if (request.getPurpose() == OtpPurpose.ACCOUNT_VERIFICATION) {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        }
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        otpService.generateAndSendOtp(user, OtpPurpose.PASSWORD_RESET);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        otpService.validateOtp(user, request.getOtp(), OtpPurpose.PASSWORD_RESET);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password reset for {}", user.getEmail());
    }
}
