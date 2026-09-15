package com.pavanwagh.dashboard.repository;

import com.pavanwagh.dashboard.entity.ProjectProposal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProposalRepository extends JpaRepository <ProjectProposal,Long >{
    long countByTeamId(Long teamId);

    List<ProjectProposal> findByTeamId(Long teamId);

}
