package com.pavanwagh.dashboard.dto;

public class AssignedTeamDetailResponse {
    private Long teamId;
    private String teamName;
    private String teamCode;
    private int currentMemberCount;

    private Long leaderUserId;
    private String leaderName;
    private String leaderEmail;

    private Long guideUserId;
    private String guideName;
    private String guideEmail;

    // Constructors
    public AssignedTeamDetailResponse() { }
    public AssignedTeamDetailResponse(Long teamId, String teamName, String teamCode, int currentMemberCount, Long leaderUserId, String leaderName, String leaderEmail, Long guideUserId, String guideName, String guideEmail) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.teamCode = teamCode;
        this.currentMemberCount = currentMemberCount;
        this.leaderUserId = leaderUserId;
        this.leaderName = leaderName;
        this.leaderEmail = leaderEmail;
        this.guideUserId = guideUserId;
        this.guideName = guideName;
        this.guideEmail = guideEmail;
    }

    // Getters and Setters
    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getTeamCode() {
        return teamCode;
    }

    public void setTeamCode(String teamCode) {
        this.teamCode = teamCode;
    }

    public int getCurrentMemberCount() {
        return currentMemberCount;
    }

    public void setCurrentMemberCount(int currentMemberCount) {
        this.currentMemberCount = currentMemberCount;
    }

    public Long getLeaderUserId() {
        return leaderUserId;
    }

    public void setLeaderUserId(Long leaderUserId) {
        this.leaderUserId = leaderUserId;
    }

    public String getLeaderName() {
        return leaderName;
    }

    public void setLeaderName(String leaderName) {
        this.leaderName = leaderName;
    }

    public String getLeaderEmail() {
        return leaderEmail;
    }

    public void setLeaderEmail(String leaderEmail) {
        this.leaderEmail = leaderEmail;
    }

    public Long getGuideUserId() {
        return guideUserId;
    }

    public void setGuideUserId(Long guideUserId) {
        this.guideUserId = guideUserId;
    }

    public String getGuideName() {
        return guideName;
    }

    public void setGuideName(String guideName) {
        this.guideName = guideName;
    }

    public String getGuideEmail() {
        return guideEmail;
    }

    public void setGuideEmail(String guideEmail) {
        this.guideEmail = guideEmail;
    }
}
