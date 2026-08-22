package com.pavanwagh.dashboard.dto;
/**
 * DTO or dto = Data Transfer object for team request for getting teamName
 * */
public class TeamRequest {
    private String teamName;

    public TeamRequest() { }
    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
}