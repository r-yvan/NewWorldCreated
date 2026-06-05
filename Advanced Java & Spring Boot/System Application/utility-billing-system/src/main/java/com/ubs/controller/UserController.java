package com.ubs.controller;

import com.ubs.dto.request.UserRolesRequest;
import com.ubs.dto.request.UserStatusRequest;
import com.ubs.dto.response.PageResponse;
import com.ubs.dto.response.UserResponse;
import com.ubs.enums.UserRole;
import com.ubs.enums.UserStatus;
import com.ubs.service.UserService;
import com.ubs.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List and search users")
    public ResponseEntity<PageResponse<UserResponse>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection) {
        return ResponseEntity.ok(userService.listUsers(search, status, role, page, size, sortBy, sortDirection));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status", description = "Use INACTIVE instead of delete — users are referenced by readings, payments, and bills.")
    public ResponseEntity<UserResponse> updateStatus(@PathVariable Long id,
                                                     @Valid @RequestBody UserStatusRequest request) {
        return ResponseEntity.ok(userService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user roles")
    public ResponseEntity<UserResponse> updateRoles(@PathVariable Long id,
                                                    @Valid @RequestBody UserRolesRequest request) {
        return ResponseEntity.ok(userService.updateRoles(id, request));
    }
}
