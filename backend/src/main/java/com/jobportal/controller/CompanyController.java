package com.jobportal.controller;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.CompanyRequest;
import com.jobportal.dto.CompanyResponse;
import com.jobportal.security.UserDetailsImpl;
import com.jobportal.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Slf4j
public class CompanyController {

    private final CompanyService companyService;

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(@Valid @RequestBody CompanyRequest request) {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Recruiter {} creating company profile: {}", recruiterId, request.getName());
        CompanyResponse response = companyService.createCompany(recruiterId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Company profile created successfully"));
    }

    @PutMapping("/{companyId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable UUID companyId,
            @Valid @RequestBody CompanyRequest request) {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Recruiter {} updating company profile: {}", recruiterId, companyId);
        CompanyResponse response = companyService.updateCompany(recruiterId, companyId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Company profile updated successfully"));
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompany(@PathVariable UUID companyId) {
        log.info("Fetching company profile: {}", companyId);
        CompanyResponse response = companyService.getCompanyById(companyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Company profile retrieved successfully"));
    }

    @GetMapping("/my-companies")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getMyCompanies() {
        UUID recruiterId = getAuthenticatedUserId();
        log.info("Fetching companies for recruiter: {}", recruiterId);
        List<CompanyResponse> response = companyService.getCompaniesByRecruiter(recruiterId);
        return ResponseEntity.ok(ApiResponse.success(response, "Recruiter companies retrieved successfully"));
    }
}
