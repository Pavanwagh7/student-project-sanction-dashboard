package com.pavanwagh.dashboard.entity;

import com.pavanwagh.dashboard.enums.RequestStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "join_requests")
public class JoinRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private int joinRequestId;

    @Column(name = "student_user_id")
    private Long studentUserId;

    @Column(name = "team_id")
    private Long teamId;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_status")
    private RequestStatus requestStatus;

    // Constructors
    public JoinRequest() { } // Default Constructor required JPA
    public JoinRequest(Long studentUserId, Long teamId, RequestStatus requestStatus) {
        this.studentUserId = studentUserId;
        this.teamId = teamId;
        this.requestStatus = requestStatus;
    }

    // Setters
    public void setJoinRequestId(int joinRequestId) {
        this.joinRequestId = joinRequestId;
    }

    public void setStudentUserId(Long studentUserId) {
        this.studentUserId = studentUserId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public void setRequestStatus(RequestStatus requestStatus) {
        this.requestStatus = requestStatus;
    }

    // Getters
    public int getJoinRequestId() {
        return joinRequestId;
    }

    public Long getStudentUserId() {
        return studentUserId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public RequestStatus getRequestStatus() {
        return requestStatus;
    }
}
