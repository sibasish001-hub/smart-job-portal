package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "skills_required", columnDefinition = "TEXT")
    private String skillsRequired;

    @Column(nullable = false)
    private String location;

    @Column(name = "remote_type", nullable = false, length = 50)
    private String remoteType; // REMOTE, HYBRID, ONSITE

    @Column(name = "job_type", nullable = false, length = 50)
    private String jobType; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP

    @Column(name = "experience_level", nullable = false, length = 50)
    private String experienceLevel; // ENTRY, JUNIOR, MID, SENIOR, LEAD

    @Column(name = "salary_range", length = 100)
    private String salaryRange;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
