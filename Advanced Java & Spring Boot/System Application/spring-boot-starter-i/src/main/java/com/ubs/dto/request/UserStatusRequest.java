package com.ubs.dto.request;

import com.ubs.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserStatusRequest {
    @NotNull private UserStatus status;
}
