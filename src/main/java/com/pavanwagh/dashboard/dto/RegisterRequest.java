package com.pavanwagh.dashboard.dto;

/**
 * DTO or dto = Data Transfer object
 * */


public class RegisterRequest {
    private String email;
    private String fullName;
    private String department;
    private String password;

    // Getters
    public String getEmail () {return email;}
    public String getFullName () {return fullName;}
    public String getDepartment() {return department;}
    public String getPassword() {return password;}

    // Setters
    public void setEmail (String email) {this.email = email;}
    public void setFullName (String fullName) {this.fullName = fullName;}
    public void setDepartment (String department) {this.department = department;}
    public void setPassword (String password) {this.password = password;}
}
