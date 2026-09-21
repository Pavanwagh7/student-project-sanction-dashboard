package com.pavanwagh.dashboard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table (name = "guides")
public class Guide {
    @Id
    @Column(name = "user_id")
    private Long guideUserID;

    //Constructors
    public Guide () { /* Required by JpaRepository */ }
    public Guide (Long guideUserID) {
        this.guideUserID = guideUserID;
    }


    // Getters and Setters
    public Long getGuideUserID() {
        return guideUserID;
    }

    public void setGuideUserID(Long guideUserID) {
        this.guideUserID = guideUserID;
    }
}
