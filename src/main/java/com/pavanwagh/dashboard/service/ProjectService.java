package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.dto.SubmitProposalRequest;
import com.pavanwagh.dashboard.entity.ProjectProposal;
import com.pavanwagh.dashboard.repository.ProposalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {
    private final ProposalRepository proposalRepository;

    // Controller
    public ProjectService(ProposalRepository proposalRepository) {
        this.proposalRepository = proposalRepository;
    }

    public ResponseEntity<String> submitProposal(SubmitProposalRequest submitProposalRequest){
        ProjectProposal projectProposal = new ProjectProposal(submitProposalRequest.getTeamId(),
                submitProposalRequest.getTitle(),
                submitProposalRequest.getDescription(),
                submitProposalRequest.getFileName(),
                submitProposalRequest.getFilePath(),
                submitProposalRequest.getStatus()
        );

        proposalRepository.save(projectProposal);
        return ResponseEntity.status(HttpStatus.CREATED).body("Proposal is submited");
    }
}
