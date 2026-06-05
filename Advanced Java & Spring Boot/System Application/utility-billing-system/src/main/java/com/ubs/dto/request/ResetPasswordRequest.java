package com.ubs.dto.request;

import com.ubs.validation.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank @Email private String email;
    @NotBlank private String otp;
    @NotBlank @StrongPassword private String newPassword;
}
