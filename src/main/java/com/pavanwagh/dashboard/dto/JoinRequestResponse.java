package com.pavanwagh.dashboard.dto;

import com.pavanwagh.dashboard.enums.RequestStatus;

/**
 * DTO or dto = Data Transfer object for join request response
 * */
public class JoinRequestResponse {
    private int requestId;
    private RequestStatus requestStatus;

    public int getRequestId() {
        return requestId;
    }

    public void setRequestId(int requestId) {
        this.requestId = requestId;
    }

    public RequestStatus getRequestStatus() {
        return requestStatus;
    }

    public void setRequestStatus(RequestStatus requestStatus) {
        this.requestStatus = requestStatus;
    }
}
