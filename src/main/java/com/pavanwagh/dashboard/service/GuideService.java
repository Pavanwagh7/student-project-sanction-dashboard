package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.entity.Guide;
import com.pavanwagh.dashboard.entity.ProjectProposal;
import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.repository.GuideRepository;
;
import com.pavanwagh.dashboard.repository.ProposalRepository;
import com.pavanwagh.dashboard.repository.TeamRepository;
import org.springframework.stereotype.Service;
import com.pavanwagh.dashboard.enums.ProposalStatus;
import com.pavanwagh.dashboard.entity.ProjectProposal;
import java.util.List;

@Service
public class GuideService {

    private final GuideRepository guideRepository;
    private final TeamRepository teamRepository;
    private final ProposalRepository proposalRepository;

    public GuideService(GuideRepository guideRepository,
                        TeamRepository teamRepository, ProposalRepository proposalRepository) {
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

    public ProjectProposal selectProposal(Long proposalId) {

        ProjectProposal proposal = proposalRepository.findById(proposalId).orElse(null);

        if (proposal == null) {
            return null;
        }

        proposal.setProposalStatus(ProposalStatus.ACCEPTED);

        return proposalRepository.save(proposal);
    }

    public ProjectProposal rejectProposal(Long proposalId) {

        ProjectProposal proposal =
                proposalRepository.findById(proposalId).orElse(null);

        if (proposal == null) {
            return null;
        }

        proposal.setProposalStatus(ProposalStatus.REJECTED);

        return proposalRepository.save(proposal);
    }
}