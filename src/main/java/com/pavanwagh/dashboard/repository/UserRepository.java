package com.pavanwagh.dashboard.repository;

import com.pavanwagh.dashboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
/**
 What You Get Automatically
    save(user)
    findById(id)
    findAll()
    deleteById(id)
 */
public interface UserRepository extends JpaRepository<User, Long> {
    //Return_type findByEmail()
    User findByEmail(String email);
}
