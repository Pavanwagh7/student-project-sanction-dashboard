package com.pavanwagh.dashboard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table (name = "students")
public class Student {
    @Id
    @Column(name = "user_id")
    private Long studentUserId;

    @Column(name = "team_id")
    private Long teamId;

    // Constructors
    public Student() { } //Default Constructor (Required by JPA)
    public Student(long studentUserId, long teamId) {
        this.studentUserId = studentUserId;
        this.teamId = teamId;
    }

    // Setters
    public long getStudentUserId() {
        return studentUserId;
    }
    public void setStudentUserId(long studentUserId) {
        this.studentUserId = studentUserId;
    }

    // Getters
    public long getTeamId() {
        return teamId;
    }
    public void setTeamId(long teamId) {
        this.teamId = teamId;
    }
}
