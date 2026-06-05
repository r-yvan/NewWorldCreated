package com.ubs.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SignupResponse {
    private String message;
    private Long userId;
}
