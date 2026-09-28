package com.jobportal.repository;

import com.jobportal.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {
    List<Interview> findByCandidateIdOrderByInterviewDateAsc(UUID candidateId);
    List<Interview> findByRecruiterIdOrderByInterviewDateAsc(UUID recruiterId);
}
