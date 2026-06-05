package com.ubs.service.impl;

import com.ubs.dto.request.UserRolesRequest;
import com.ubs.dto.request.UserStatusRequest;
import com.ubs.dto.response.PageResponse;
import com.ubs.dto.response.UserResponse;
import com.ubs.entity.User;
import com.ubs.enums.UserRole;
import com.ubs.enums.UserStatus;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.mapper.UserMapper;
import com.ubs.repository.UserRepository;
import com.ubs.util.PageableUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements com.ubs.service.UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> listUsers(String search, UserStatus status, UserRole role,
                                                  Integer page, Integer size, String sortBy, String sortDirection) {
        Page<User> result = userRepository.search(search, status, role,
                PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(userMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return userMapper.toResponse(findUser(id));
    }

    @Override
    @Transactional
    public UserResponse updateStatus(Long id, UserStatusRequest request) {
        User user = findUser(id);
        user.setStatus(request.getStatus());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateRoles(Long id, UserRolesRequest request) {
        User user = findUser(id);
        user.setRoles(request.getRoles());
        return userMapper.toResponse(userRepository.save(user));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
