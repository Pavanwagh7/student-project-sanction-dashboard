package com.pavanwagh.dashboard.repository;

import com.pavanwagh.dashboard.entity.User;
import com.pavanwagh.dashboard.enums.BranchEnum;
import com.pavanwagh.dashboard.enums.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 What You Get Automatically
    save(user)
    findById(id)
    findAll()
    deleteById(id)
 */
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    boolean existsByEmail(String email);

    // Fixed: Capital 'B' in 'findBy'
    List<User> findByDepartmentAndRole(String department, RoleEnum roleEnum);
}