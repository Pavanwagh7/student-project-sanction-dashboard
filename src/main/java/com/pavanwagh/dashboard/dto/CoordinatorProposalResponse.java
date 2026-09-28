package com.pavanwagh.dashboard.dto;

import com.pavanwagh.dashboard.enums.ProposalStatus;
import java.time.LocalDateTime;

public class CoordinatorProposalResponse {
    private Long proposalId;
    private Long teamId;
    private String teamName;
    private String teamCode;
    private String leaderName;
    private String leaderEmail;

    private Long guideUserId;
    private String guideName;
    private String guideEmail;

    private String title;
    private String projectDescription;
    private String pdfFileName;
    private ProposalStatus proposalStatus;
    private LocalDateTime submittedAt;

    // Constructor
    public CoordinatorProposalResponse() { }
    public CoordinatorProposalResponse(Long proposalId, Long teamId, String teamName, String teamCode, String leaderName, String leaderEmail, Long guideUserId, String guideName, String guideEmail, String title, String projectDescription, String pdfFileName, ProposalStatus proposalStatus, LocalDateTime submittedAt) {
        this.proposalId = proposalId;
        this.teamId = teamId;
        this.teamName = teamName;
        this.teamCode = teamCode;
        this.leaderName = leaderName;
        this.leaderEmail = leaderEmail;
        this.guideUserId = guideUserId;
        this.guideName = guideName;
        this.guideEmail = guideEmail;
        this.title = title;
        this.projectDescription = projectDescription;
        this.pdfFileName = pdfFileName;
        this.proposalStatus = proposalStatus;
        this.submittedAt = submittedAt;
    }

    // Getters and Setters
    public Long getProposalId() { return proposalId; }
    public void setProposalId(Long proposalId) { this.proposalId = proposalId; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getTeamCode() { return teamCode; }
    public void setTeamCode(String teamCode) { this.teamCode = teamCode; }

    public String getLeaderName() { return leaderName; }
    public void setLeaderName(String leaderName) { this.leaderName = leaderName; }

    public String getLeaderEmail() { return leaderEmail; }
    public void setLeaderEmail(String leaderEmail) { this.leaderEmail = leaderEmail; }

    public Long getGuideUserId() { return guideUserId; }
    public void setGuideUserId(Long guideUserId) { this.guideUserId = guideUserId; }

    public String getGuideName() { return guideName; }
    public void setGuideName(String guideName) { this.guideName = guideName; }

    public String getGuideEmail() { return guideEmail; }
    public void setGuideEmail(String guideEmail) { this.guideEmail = guideEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProjectDescription() { return projectDescription; }
    public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }

    public String getPdfFileName() { return pdfFileName; }
    public void setPdfFileName(String pdfFileName) { this.pdfFileName = pdfFileName; }

    public ProposalStatus getProposalStatus() { return proposalStatus; }
    public void setProposalStatus(ProposalStatus proposalStatus) { this.proposalStatus = proposalStatus; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}