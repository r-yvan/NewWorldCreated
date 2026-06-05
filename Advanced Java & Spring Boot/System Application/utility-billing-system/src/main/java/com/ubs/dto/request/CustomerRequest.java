package com.ubs.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank private String fullNames;
    @NotBlank private String nationalId;
    @NotBlank @Email private String email;
    @NotBlank private String phoneNumber;
    @NotBlank private String address;
}
