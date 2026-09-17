package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.dto.SubmitProposalRequest;
import com.pavanwagh.dashboard.entity.ProjectProposal;
import com.pavanwagh.dashboard.repository.ProposalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class ProjectService {
    private final ProposalRepository proposalRepository;

    // Constructor
    public ProjectService(ProposalRepository proposalRepository) {
        this.proposalRepository = proposalRepository;
    }

    public ResponseEntity<String> submitProposal(MultipartFile file, SubmitProposalRequest submitProposalRequest){
        long proposalCount = proposalRepository.countByTeamId(submitProposalRequest.getTeamId());
        if (proposalCount >= 3) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You can submit maximum 3 proposals.");
        }

        // Save file to File Storage
        try {
            file.transferTo(new java.io.File(submitProposalRequest.getFilePath() + submitProposalRequest.getFileName()));
        } catch (IllegalStateException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unable to save file.");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unable to save file.");
        }

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

    public ResponseEntity<String> deleteProposal(Long proposalId, Long teamId) {
        ProjectProposal proposal = proposalRepository.findById(proposalId).orElse(null);
        if (proposal == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Proposal not found.");
        }
        if (!proposal.getTeamId().equals(teamId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to delete this proposal.");
        }

        File file = new File(proposal.getPdfFilePath() + proposal.getPdfFileName());
        if (file.exists()) {
            file.delete();
        }

        proposalRepository.deleteById(proposalId);
        return ResponseEntity.ok("Proposal deleted successfully.");
    }

    public List<ProjectProposal> getTeamProposals(Long teamId) {
        return proposalRepository.findByTeamId(teamId);
    }
}
