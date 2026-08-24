package com.pavanwagh.dashboard.entity;

import com.pavanwagh.dashboard.enums.ProposalStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "project_proposals")
public class ProjectProposal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "proposal_id")
    private Long proposalId;

    @Column(name = "team_id")
    private Long teamId;

    @Column(name = "title")
     private String title;

    @Column(name = "project_description")
     private String projectDescription;

    @Column(name = "pdf_file_name")
     private String pdfFileName ;

    @Column(name = "pdf_file_path")
     private String pdfFilePath ;

    @Enumerated(EnumType.STRING)
    @Column(name = "proposal_status")
     private ProposalStatus proposalStatus ;

    // Constructors
    public ProjectProposal() { } // Default Constructor required JPA
    public ProjectProposal(Long teamId, String title, String projectDescription, String pdfFileName, String pdfFilePath, ProposalStatus proposalStatus) {
        this.teamId = teamId;
        this.title = title;
        this.projectDescription = projectDescription;
        this.pdfFileName = pdfFileName;
        this.pdfFilePath = pdfFilePath;
        this.proposalStatus = proposalStatus;
    }

    public Long getProposalId() {
        return proposalId;
    }

    public void setProposalId(Long proposalId) {
        this.proposalId = proposalId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getProjectDescription() {
        return projectDescription;
    }

    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }

    public String getPdfFileName() {
        return pdfFileName;
    }

    public void setPdfFileName(String pdfFileName) {
        this.pdfFileName = pdfFileName;
    }

    public String getPdfFilePath() {
        return pdfFilePath;
    }

    public void setPdfFilePath(String pdfFilePath) {
        this.pdfFilePath = pdfFilePath;
    }

    public ProposalStatus getProposalStatus() {
        return proposalStatus;
    }

    public void setProposalStatus(ProposalStatus proposalStatus) {
        this.proposalStatus = proposalStatus;
    }


}
