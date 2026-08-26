package com.pavanwagh.dashboard.dto;

import com.pavanwagh.dashboard.enums.ProposalStatus;

public class SubmitProposalRequest {
    private Long teamId;
    private String title;
    private String description;
    private String fileName;
    private String filePath;
    private ProposalStatus status;


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public ProposalStatus getStatus() {
        return status;
    }

    public void setStatus(ProposalStatus status) {
        this.status = status;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
}
