package com.pavanwagh.dashboard.entity;

import jakarta.persistence.*;

@Entity
@Table (name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    @Column(name = "team_name")
    private String teamName;

    @Column(name = "team_code")
    private String teamCode;

    @Column(name = "leader_user_id")
    private long leaderUserId;

    @Column(name = "current_member_count")
    private int currentMemberCount;


    // Constructors
    public Team () { }//Default Constructor -  For JPA
    public Team(String teamName, String teamCode, long leaderUserId) {
        this.teamName = teamName;
        this.teamCode = teamCode;
        this.leaderUserId = leaderUserId;
        this.currentMemberCount = 1; // this actually happen when student will create a new team with one member himself/ herself only
    }

    // Getters
    public int getCurrentMemberCount() {
        return currentMemberCount;
    }
    public long getLeaderUserId() {
        return leaderUserId;
    }
    public String getTeamCode() {
        return teamCode;
    }
    public String getTeamName() {
        return teamName;
    }
    public Long getTeamId() {
        return teamId;
    }

    // Setters
    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setTeamCode(String teamCode) {
        this.teamCode = teamCode;
    }

    public void setLeaderUserId(long leaderUserId) {
        this.leaderUserId = leaderUserId;
    }

    public void setCurrentMemberCount(int currentMemberCount) {
        this.currentMemberCount = currentMemberCount;
    }
}
