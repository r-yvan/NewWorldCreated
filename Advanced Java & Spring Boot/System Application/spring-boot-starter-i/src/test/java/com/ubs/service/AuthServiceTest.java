package com.ubs.service;

import com.ubs.dto.request.LoginRequest;
import com.ubs.dto.request.SignupRequest;
import com.ubs.dto.response.AuthResponse;
import com.ubs.dto.response.SignupResponse;
import com.ubs.entity.User;
import com.ubs.enums.UserRole;
import com.ubs.enums.UserStatus;
import com.ubs.exception.ConflictException;
import com.ubs.exception.InactiveAccountException;
import com.ubs.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private OtpService otpService;

    @Test
    void signupCreatesInactiveUser() {
        SignupRequest request = new SignupRequest();
        request.setFullNames("Test User");
        request.setEmail("test@example.com");
        request.setPhoneNumber("0788000099");
        request.setPassword("StrongPass123!");
        request.setRole(UserRole.ROLE_CUSTOMER);

        SignupResponse response = authService.signup(request);

        assertNotNull(response.getUserId());
        User user = userRepository.findById(response.getUserId()).orElseThrow();
        assertEquals(UserStatus.INACTIVE, user.getStatus());
    }

    @Test
    void signupRejectsDuplicateEmail() {
        User existing = User.builder()
                .fullNames("Existing")
                .email("dup@example.com")
                .phoneNumber("0788000000")
                .password(passwordEncoder.encode("StrongPass123!"))
                .status(UserStatus.ACTIVE)
                .roles(Set.of(UserRole.ROLE_CUSTOMER))
                .build();
        userRepository.save(existing);

        SignupRequest request = new SignupRequest();
        request.setFullNames("Another");
        request.setEmail("dup@example.com");
        request.setPhoneNumber("0788000001");
        request.setPassword("StrongPass123!");
        request.setRole(UserRole.ROLE_CUSTOMER);

        assertThrows(ConflictException.class, () -> authService.signup(request));
    }

    @Test
    void loginReturnsJwtForActiveUser() {
        User user = User.builder()
                .fullNames("Active User")
                .email("active@example.com")
                .phoneNumber("0788000010")
                .password(passwordEncoder.encode("StrongPass123!"))
                .status(UserStatus.ACTIVE)
                .roles(Set.of(UserRole.ROLE_ADMIN))
                .build();
        userRepository.save(user);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);

        LoginRequest request = new LoginRequest();
        request.setEmail("active@example.com");
        request.setPassword("StrongPass123!");

        AuthResponse response = authService.login(request);
        assertNotNull(response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
    }

    @Test
    void inactiveUserCannotLogin() {
        User user = User.builder()
                .fullNames("Inactive")
                .email("inactive@example.com")
                .phoneNumber("0788000011")
                .password(passwordEncoder.encode("StrongPass123!"))
                .status(UserStatus.INACTIVE)
                .roles(Set.of(UserRole.ROLE_CUSTOMER))
                .build();
        userRepository.save(user);

        LoginRequest request = new LoginRequest();
        request.setEmail("inactive@example.com");
        request.setPassword("StrongPass123!");

        assertThrows(InactiveAccountException.class, () -> authService.login(request));
    }
}
