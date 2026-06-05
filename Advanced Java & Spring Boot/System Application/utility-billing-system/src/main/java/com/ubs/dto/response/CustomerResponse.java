package com.ubs.dto.response;

import com.ubs.enums.CustomerStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponse {
    private Long id;
    private String fullNames;
    private String nationalId;
    private String email;
    private String phoneNumber;
    private String address;
    private CustomerStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
