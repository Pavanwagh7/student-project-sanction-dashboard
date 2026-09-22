package com.pavanwagh.dashboard.entity;

import com.pavanwagh.dashboard.enums.RoleEnum;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String email;
    private String password;

    @Column(name = "full_name")
    private String fullName;

    private String department;

    @Enumerated(EnumType.STRING)
    private RoleEnum role;

    //Default Constructor (required by JPA)
    public User() {}


    public User(String email, String password, String fullName, String department, RoleEnum role) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.department = department;
        this.role = role;
    }

    //Getters
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getFullName() {
        return fullName;
    }

    public String getDepartment() {
        return department;
    }

    public RoleEnum getRole() {
        return role;
    }

    //Setters
    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setRole(RoleEnum role) {
        this.role = role;
    }
}