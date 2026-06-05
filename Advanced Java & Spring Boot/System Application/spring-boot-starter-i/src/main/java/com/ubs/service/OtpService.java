package com.ubs.service;

import com.ubs.entity.Otp;
import com.ubs.entity.User;
import com.ubs.enums.OtpPurpose;
import com.ubs.exception.BadRequestException;
import com.ubs.exception.BusinessRuleException;
import com.ubs.repository.OtpRepository;
import com.ubs.util.OtpUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final OtpUtil otpUtil;
    private final EmailService emailService;

    @Value("${app.otp.expiry-minutes}")
    private int expiryMinutes;

    @Transactional
    public void generateAndSendOtp(User user, OtpPurpose purpose) {
        String code = otpUtil.generateOtpCode();
        Otp otp = Otp.builder()
                .user(user)
                .otpHash(otpUtil.hashOtp(code))
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .used(false)
                .build();
        otpRepository.save(otp);

        String subject = switch (purpose) {
            case ACCOUNT_VERIFICATION -> "Verify your UBS account";
            case PASSWORD_RESET -> "Reset your UBS password";
            case LOGIN_VERIFICATION -> "Login verification code";
        };
        String body = "Your OTP code is: " + code + "\nThis code expires in " + expiryMinutes + " minutes.";
        emailService.sendEmail(user.getEmail(), subject, body);
        log.info("OTP generated for user {} purpose {}", user.getEmail(), purpose);
    }

    @Transactional
    public void validateOtp(User user, String rawOtp, OtpPurpose purpose) {
        Otp otp = otpRepository.findTopByUserAndPurposeAndUsedFalseOrderByCreatedAtDesc(user, purpose)
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (otp.getUsed() || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        if (!otpUtil.matches(rawOtp, otp.getOtpHash())) {
            throw new BadRequestException("Invalid OTP");
        }
        otp.setUsed(true);
        otpRepository.save(otp);
    }

    @Transactional
    public void verifyAccount(User user, String rawOtp) {
        validateOtp(user, rawOtp, OtpPurpose.ACCOUNT_VERIFICATION);
        user.setStatus(com.ubs.enums.UserStatus.ACTIVE);
    }
}
