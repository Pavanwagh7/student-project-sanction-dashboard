package com.pavanwagh.dashboard.dto;

public class GetJoinRequest {
    private int requestId;
    private String name;
    private String email;

    // Constructor
    public GetJoinRequest(int requestId, String name, String email) {
        this.requestId = requestId;
        this.name = name;
        this.email = email;
    }

    // Getter and Setters
    public int getRequestId() {
        return requestId;
    }

    public void setRequestId(int requestId) {
        this.requestId = requestId;
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
}
