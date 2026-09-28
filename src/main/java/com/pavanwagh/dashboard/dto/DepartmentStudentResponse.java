package com.pavanwagh.dashboard.dto;

public class DepartmentStudentResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String department;
    private Long teamId;
    private String teamName;
    private String teamCode;
    private boolean isLeader;

    // constructors
    public DepartmentStudentResponse() { }
    public DepartmentStudentResponse(Long userId, String fullName, String email, String department, Long teamId, String teamName, String teamCode, boolean isLeader) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.teamId = teamId;
        this.teamName = teamName;
        this.teamCode = teamCode;
        this.isLeader = isLeader;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

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

    public boolean isLeader() {
        return isLeader;
    }

    public void setLeader(boolean leader) {
        isLeader = leader;
    }
}
