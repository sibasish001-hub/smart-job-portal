package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "resume_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "ats_score", nullable = false)
    private int atsScore;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    @Column(columnDefinition = "TEXT")
    private String improvements;

    @Column(name = "suggested_certifications", columnDefinition = "TEXT")
    private String suggestedCertifications;

    @Column(name = "career_path", columnDefinition = "TEXT")
    private String careerPath;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
