package com.jobportal.repository;

import com.jobportal.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findByName(String name);
    List<Company> findByRecruiterId(UUID recruiterId);
}
