package com.jobportal.controller;

import com.jobportal.dto.ApiResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserRepository userRepository;

    /**
     * GET /api/admin/users — returns all users (ADMIN only)
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        log.info("Admin fetching all users");
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> dto = new java.util.LinkedHashMap<>();
                    dto.put("id", u.getId());
                    dto.put("email", u.getEmail());
                    dto.put("role", u.getRole().name());
                    dto.put("isVerified", u.isVerified());
                    dto.put("firstName", u.getProfile() != null ? u.getProfile().getFirstName() : null);
                    dto.put("lastName", u.getProfile() != null ? u.getProfile().getLastName() : null);
                    dto.put("createdAt", u.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }
}
