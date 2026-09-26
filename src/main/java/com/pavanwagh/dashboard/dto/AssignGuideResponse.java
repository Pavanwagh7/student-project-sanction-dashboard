package com.pavanwagh.dashboard.dto;

public class AssignGuideResponse {
    private Long guideuserId;
    private Long teamId;

    // Constructor
    public AssignGuideResponse(Long guideuserId, Long teamId) {
        this.guideuserId = guideuserId;
        this.teamId = teamId;
    }

    // Getters and Setters
    public Long getGuideuserId() {
        return guideuserId;
    }

    public void setGuideuserId(Long guideuserId) {
        this.guideuserId = guideuserId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
}
