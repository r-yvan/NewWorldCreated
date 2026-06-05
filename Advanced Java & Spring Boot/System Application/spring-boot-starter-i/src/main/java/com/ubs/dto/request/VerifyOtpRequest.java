package com.ubs.dto.request;

import com.ubs.enums.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank @Email private String email;
    @NotBlank private String otp;
    @NotNull private OtpPurpose purpose;
}
