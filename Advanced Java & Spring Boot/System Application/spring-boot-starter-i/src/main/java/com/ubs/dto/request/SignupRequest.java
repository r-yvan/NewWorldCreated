package com.ubs.dto.request;

import com.ubs.enums.UserRole;
import com.ubs.validation.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank private String fullNames;
    @NotBlank @Email private String email;
    @NotBlank private String phoneNumber;
    @NotBlank @StrongPassword private String password;
    @NotNull private UserRole role;
}
