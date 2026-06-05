package com.ubs.service;

import com.ubs.dto.request.UserRolesRequest;
import com.ubs.dto.request.UserStatusRequest;
import com.ubs.dto.response.PageResponse;
import com.ubs.dto.response.UserResponse;
import com.ubs.enums.UserRole;
import com.ubs.enums.UserStatus;

public interface UserService {

    PageResponse<UserResponse> listUsers(String search, UserStatus status, UserRole role,
                                         Integer page, Integer size, String sortBy, String sortDirection);

    UserResponse getById(Long id);

    UserResponse updateStatus(Long id, UserStatusRequest request);

    UserResponse updateRoles(Long id, UserRolesRequest request);
}
