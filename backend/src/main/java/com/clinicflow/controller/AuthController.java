package com.clinicflow.controller;

import com.clinicflow.dto.request.LoginRequest;
import com.clinicflow.dto.response.ApiResponse;
import com.clinicflow.dto.response.AuthResponse;
import com.clinicflow.entity.User;
import com.clinicflow.exception.BadRequestException;
import com.clinicflow.repository.UserRepository;
import com.clinicflow.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and JWT token generation")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          UserDetailsService userDetailsService,
                          JwtUtils jwtUtils,
                          UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT bearer token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        String token = jwtUtils.generateToken(userDetails, user.getRole().name(), user.getId());

        AuthResponse authResponse = new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Authentication successful"));
    }
}
