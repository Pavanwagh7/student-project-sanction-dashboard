package com.pavanwagh.dashboard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    @Column(nullable = false, unique = true)
    private String sanctionNumber;

    @Column(nullable = false)
    private Long teamId;

    private Long guideId;

    @Column(nullable = false)
    private Long proposalId;

    @Column(nullable = false)
    private String projectTitle;

    private LocalDateTime sanctionedAt;

    // Constructor
    public Project() { /* Required by JPA */}

    // Getters and Setters
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getSanctionNumber() { return sanctionNumber; }
    public void setSanctionNumber(String sanctionNumber) { this.sanctionNumber = sanctionNumber; }
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public Long getGuideId() { return guideId; }
    public void setGuideId(Long guideId) { this.guideId = guideId; }
    public Long getProposalId() { return proposalId; }
    public void setProposalId(Long proposalId) { this.proposalId = proposalId; }
    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }
    public LocalDateTime getSanctionedAt() { return sanctionedAt; }
    public void setSanctionedAt(LocalDateTime sanctionedAt) { this.sanctionedAt = sanctionedAt; }
}