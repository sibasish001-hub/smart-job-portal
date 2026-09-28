package com.jobportal.service;

import com.jobportal.dto.CompanyRequest;
import com.jobportal.dto.CompanyResponse;
import com.jobportal.entity.Company;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    private CompanyResponse mapToResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .recruiterId(company.getRecruiter().getId())
                .name(company.getName())
                .description(company.getDescription())
                .industry(company.getIndustry())
                .website(company.getWebsite())
                .logoUrl(company.getLogoUrl())
                .build();
    }

    @Override
    @Transactional
    public CompanyResponse createCompany(UUID recruiterId, CompanyRequest request) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter user not found"));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new AccessDeniedException("Only users with role RECRUITER can create company profiles");
        }

        if (companyRepository.findByName(request.getName()).isPresent()) {
            throw new BadRequestException("Company name is already registered");
        }

        Company company = Company.builder()
                .recruiter(recruiter)
                .name(request.getName())
                .description(request.getDescription())
                .industry(request.getIndustry())
                .website(request.getWebsite())
                .logoUrl(request.getLogoUrl())
                .build();

        company = companyRepository.save(company);
        log.info("Company profile created: {} by recruiter {}", company.getName(), recruiterId);
        return mapToResponse(company);
    }

    @Override
    @Transactional
    public CompanyResponse updateCompany(UUID recruiterId, UUID companyId, CompanyRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (!company.getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You do not have permission to manage this company");
        }

        // Check if name is taken by another company
        companyRepository.findByName(request.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(companyId)) {
                throw new BadRequestException("Company name is already taken");
            }
        });

        company.setName(request.getName());
        company.setDescription(request.getDescription());
        company.setIndustry(request.getIndustry());
        company.setWebsite(request.getWebsite());
        company.setLogoUrl(request.getLogoUrl());

        company = companyRepository.save(company);
        log.info("Company profile updated: {}", company.getName());
        return mapToResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return mapToResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getCompaniesByRecruiter(UUID recruiterId) {
        return companyRepository.findByRecruiterId(recruiterId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
