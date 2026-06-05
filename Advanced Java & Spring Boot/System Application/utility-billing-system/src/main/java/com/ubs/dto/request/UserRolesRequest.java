package com.ubs.dto.request;

import com.ubs.enums.UserRole;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class UserRolesRequest {
    @NotEmpty private Set<UserRole> roles;
}
