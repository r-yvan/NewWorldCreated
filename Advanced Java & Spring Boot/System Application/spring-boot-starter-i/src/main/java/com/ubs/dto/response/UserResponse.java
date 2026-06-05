package com.ubs.dto.response;

import com.ubs.enums.UserRole;
import com.ubs.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullNames;
    private String email;
    private String phoneNumber;
    private UserStatus status;
    private Set<UserRole> roles;
}
