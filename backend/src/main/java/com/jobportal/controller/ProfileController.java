package com.jobportal.controller;

import com.jobportal.dto.ApiResponse;
import com.jobportal.entity.Profile;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    private UUID getAuthUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    /**
     * GET /api/profile/me — returns current user's profile
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProfile() {
        UUID userId = getAuthUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile p = user.getProfile();
        Map<String, Object> dto = buildDto(p);
        return ResponseEntity.ok(ApiResponse.success(dto, "Profile retrieved"));
    }

    /**
     * PUT /api/profile/me — update current user's profile
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateMyProfile(@RequestBody Map<String, String> body) {
        UUID userId = getAuthUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile p = user.getProfile();
        if (p == null) {
            p = Profile.builder().user(user).build();
        }

        if (body.containsKey("firstName"))   p.setFirstName(body.get("firstName"));
        if (body.containsKey("lastName"))    p.setLastName(body.get("lastName"));
        if (body.containsKey("phone"))       p.setPhone(body.get("phone"));
        if (body.containsKey("location"))    p.setLocation(body.get("location"));
        if (body.containsKey("bio"))         p.setBio(body.get("bio"));
        if (body.containsKey("title"))       p.setTitle(body.get("title"));
        if (body.containsKey("githubUrl"))   p.setGithubUrl(body.get("githubUrl"));
        if (body.containsKey("linkedinUrl")) p.setLinkedinUrl(body.get("linkedinUrl"));
        if (body.containsKey("websiteUrl"))  p.setWebsiteUrl(body.get("websiteUrl"));

        profileRepository.save(p);
        log.info("Profile updated for user: {}", userId);

        return ResponseEntity.ok(ApiResponse.success(buildDto(p), "Profile updated successfully"));
    }

    private Map<String, Object> buildDto(Profile p) {
        Map<String, Object> dto = new LinkedHashMap<>();
        if (p == null) return dto;
        dto.put("firstName",   p.getFirstName());
        dto.put("lastName",    p.getLastName());
        dto.put("phone",       p.getPhone());
        dto.put("location",    p.getLocation());
        dto.put("bio",         p.getBio());
        dto.put("title",       p.getTitle());
        dto.put("githubUrl",   p.getGithubUrl());
        dto.put("linkedinUrl", p.getLinkedinUrl());
        dto.put("websiteUrl",  p.getWebsiteUrl());
        return dto;
    }
}
