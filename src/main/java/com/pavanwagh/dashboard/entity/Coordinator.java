package com.pavanwagh.dashboard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "coordinators")
public class Coordinator {
    @Id
    @Column(name = "user_id")
    private Long coordinatorUserId;

    // Constructors
    public Coordinator() { /* Required by JpaRepository */ }
    public Coordinator(Long coordinatorUserId) {
        this.coordinatorUserId = coordinatorUserId;
    }

    // Getters and Setters
    public Long getCoordinatorUserId() {
        return coordinatorUserId;
    }

    public void setCoordinatorUserId(Long coordinatorUserId) {
        this.coordinatorUserId = coordinatorUserId;
    }
}
