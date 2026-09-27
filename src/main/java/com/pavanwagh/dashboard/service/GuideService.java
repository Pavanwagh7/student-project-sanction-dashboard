package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.entity.Guide;
import com.pavanwagh.dashboard.entity.ProjectProposal;
import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.repository.GuideRepository;
import com.pavanwagh.dashboard.repository.ProposalRepository;
import com.pavanwagh.dashboard.repository.TeamRepository;
import com.pavanwagh.dashboard.enums.ProposalStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GuideService {

    private final GuideRepository guideRepository;
    private final TeamRepository teamRepository;
    private final ProposalRepository proposalRepository;

    public GuideService(GuideRepository guideRepository, TeamRepository teamRepository, ProposalRepository proposalRepository) {
        this.guideRepository = guideRepository;
        this.teamRepository = teamRepository;
        this.proposalRepository = proposalRepository;
    }

    public List<Team> getAssignedTeams(Long guideUserId) {

        // Check whether guide exists
        Guide guide = guideRepository.findById(guideUserId).orElse(null);

        if (guide == null) {
            return List.of();
        }

        // Get teams assigned to this guide
        return teamRepository.findByGuideUserId(guideUserId);
    }

    public List<ProjectProposal> getTeamProposals(Long teamId) {
        return proposalRepository.findByTeamId(teamId);
    }

    // Selects a proposal and automatically rejects all sibling proposals for this team
    @Transactional
    public ProjectProposal selectProposal(Long proposalId) {

        ProjectProposal proposal = proposalRepository.findById(proposalId).orElse(null);

        if (proposal == null) {
            return null;
        }

        // Mark the selected proposal as ACCEPTED
        proposal.setProposalStatus(ProposalStatus.ACCEPTED);
        ProjectProposal savedProposal = proposalRepository.save(proposal);

        // Sibling Cascade: Automatically mark all other proposals for this team as REJECTED
        Long teamId = proposal.getTeamId();
        if (teamId != null) {
            List<ProjectProposal> allTeamProposals = proposalRepository.findByTeamId(teamId);
            for (ProjectProposal sibling : allTeamProposals) {
                if (!sibling.getProposalId().equals(proposalId)) {
                    sibling.setProposalStatus(ProposalStatus.REJECTED);
                    proposalRepository.save(sibling);
                }
            }
        }

        return savedProposal;
    }

    @Transactional
    public ProjectProposal rejectProposal(Long proposalId) {

        ProjectProposal proposal = proposalRepository.findById(proposalId).orElse(null);

        if (proposal == null) {
            return null;
        }

        proposal.setProposalStatus(ProposalStatus.REJECTED);

        return proposalRepository.save(proposal);
    }
}