package com.ubs.repository;

import com.ubs.entity.Otp;
import com.ubs.entity.User;
import com.ubs.enums.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findTopByUserAndPurposeAndUsedFalseOrderByCreatedAtDesc(User user, OtpPurpose purpose);
}
