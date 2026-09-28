package com.pavanwagh.dashboard.repository;

import com.pavanwagh.dashboard.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProposalId(Long proposalId);
    boolean existsByProposalId(Long proposalId);
}