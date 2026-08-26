package com.pavanwagh.dashboard.repository;

import com.pavanwagh.dashboard.entity.ProjectProposal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProposalRepository extends JpaRepository <ProjectProposal,Long >{
}
