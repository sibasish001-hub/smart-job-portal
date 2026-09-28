package com.jobportal.repository;

import com.jobportal.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, UUID> {
    Optional<ResumeAnalysis> findFirstByResumeUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<ResumeAnalysis> findFirstByResumeIdOrderByCreatedAtDesc(UUID resumeId);
}
