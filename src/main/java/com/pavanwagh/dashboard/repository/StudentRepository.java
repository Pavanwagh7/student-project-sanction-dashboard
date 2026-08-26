package com.pavanwagh.dashboard.repository;

import com.pavanwagh.dashboard.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student,Long> {

    List<Student> findByTeamId(Long teamId);

}
