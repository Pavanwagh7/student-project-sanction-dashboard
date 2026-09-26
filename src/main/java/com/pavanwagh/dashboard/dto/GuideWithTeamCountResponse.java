package com.pavanwagh.dashboard.dto;

public class GuideWithTeamCountResponse {
    private Long userId;
    private String name;
    private String email;
    private String department;
    private long assignedTeamCount;

    // Constructor
    public GuideWithTeamCountResponse() {}
    public GuideWithTeamCountResponse(Long userId, String name, String email, String department, long assignedTeamCount) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.department = department;
        this.assignedTeamCount = assignedTeamCount;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public long getAssignedTeamCount() {
        return assignedTeamCount;
    }

    public void setAssignedTeamCount(long assignedTeamCount) {
        this.assignedTeamCount = assignedTeamCount;
    }
}