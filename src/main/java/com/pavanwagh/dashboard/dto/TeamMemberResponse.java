package com.pavanwagh.dashboard.dto;

public class TeamMemberResponse {
    private String email;
    private String name;

    // Constructor
    public TeamMemberResponse (String email, String name) {
        this.email = email;
        this.name = name;
    }

    // Getters and setters
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
}
