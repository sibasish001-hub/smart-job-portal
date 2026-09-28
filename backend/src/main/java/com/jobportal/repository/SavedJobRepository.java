package com.jobportal.repository;

import com.jobportal.entity.SavedJob;
import com.jobportal.entity.SavedJobId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, SavedJobId> {
    List<SavedJob> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<SavedJob> findByUserIdAndJobId(UUID userId, UUID jobId);
    void deleteByUserIdAndJobId(UUID userId, UUID jobId);
    long countByUserId(UUID userId);
    boolean existsByUserIdAndJobId(UUID userId, UUID jobId);
}
