package com.jobportal.repository;

import com.jobportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId);
    List<Application> findByJobIdOrderByCreatedAtDesc(UUID jobId);
    List<Application> findByJobCompanyRecruiterId(UUID recruiterId);
    Optional<Application> findByJobIdAndCandidateId(UUID jobId, UUID candidateId);
    long countByJobCompanyRecruiterId(UUID recruiterId);
}
