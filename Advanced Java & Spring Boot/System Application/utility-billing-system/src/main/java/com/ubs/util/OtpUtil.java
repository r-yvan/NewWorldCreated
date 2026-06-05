package com.ubs.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OtpUtil {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    public String generateOtpCode() {
        return String.format("%06d", random.nextInt(1_000_000));
    }

    public String hashOtp(String otp) {
        return encoder.encode(otp);
    }

    public boolean matches(String rawOtp, String hashedOtp) {
        return encoder.matches(rawOtp, hashedOtp);
    }
}
