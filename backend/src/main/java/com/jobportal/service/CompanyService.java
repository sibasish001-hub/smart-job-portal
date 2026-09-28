package com.jobportal.service;

import com.jobportal.dto.CompanyRequest;
import com.jobportal.dto.CompanyResponse;

import java.util.List;
import java.util.UUID;

public interface CompanyService {
    CompanyResponse createCompany(UUID recruiterId, CompanyRequest request);
    CompanyResponse updateCompany(UUID recruiterId, UUID companyId, CompanyRequest request);
    CompanyResponse getCompanyById(UUID companyId);
    List<CompanyResponse> getCompaniesByRecruiter(UUID recruiterId);
}
