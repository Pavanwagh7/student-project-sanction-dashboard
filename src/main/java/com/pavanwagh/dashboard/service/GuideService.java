package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.dto.AssignedTeamDetailResponse;
import com.pavanwagh.dashboard.dto.CoordinatorProposalResponse;
import com.pavanwagh.dashboard.dto.DepartmentStudentResponse;
import com.pavanwagh.dashboard.entity.Guide;
import com.pavanwagh.dashboard.entity.ProjectProposal;
import com.pavanwagh.dashboard.entity.Student;
import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.entity.User;
import com.pavanwagh.dashboard.repository.GuideRepository;
import com.pavanwagh.dashboard.repository.ProposalRepository;
import com.pavanwagh.dashboard.repository.StudentRepository;
import com.pavanwagh.dashboard.repository.TeamRepository;
import com.pavanwagh.dashboard.repository.UserRepository;
import com.pavanwagh.dashboard.enums.ProposalStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class GuideService {

    private final GuideRepository guideRepository;
    private final TeamRepository teamRepository;
    private final ProposalRepository proposalRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public GuideService(GuideRepository guideRepository,
                        TeamRepository teamRepository,
                        ProposalRepository proposalRepository,
                        UserRepository userRepository,
                        StudentRepository studentRepository) {
        this.guideRepository = guideRepository;
        this.teamRepository = teamRepository;
        this.proposalRepository = proposalRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
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

    public List<AssignedTeamDetailResponse> getAssignedTeamsDetailed(Long guideUserId) {
        List<Team> teams = teamRepository.findByGuideUserId(guideUserId);
        List<AssignedTeamDetailResponse> responses = new ArrayList<>();

        User guide = userRepository.findById(guideUserId).orElse(null);
        String guideName = (guide != null) ? guide.getFullName() : "Assigned Guide";
        String guideEmail = (guide != null) ? guide.getEmail() : "N/A";

        for (Team team : teams) {
            Long leaderUserId = team.getLeaderUserId();
            User leader = (leaderUserId != null) ? userRepository.findById(leaderUserId).orElse(null) : null;
            String leaderName = (leader != null) ? leader.getFullName() : "Team Leader";
            String leaderEmail = (leader != null) ? leader.getEmail() : "N/A";

            responses.add(new AssignedTeamDetailResponse(
                    team.getTeamId(),
                    team.getTeamName(),
                    team.getTeamCode(),
                    team.getCurrentMemberCount(),
                    leaderUserId,
                    leaderName,
                    leaderEmail,
                    guideUserId,
                    guideName,
                    guideEmail
            ));
        }
        return responses;
    }

    public List<CoordinatorProposalResponse> getAllGuideProposals(Long guideUserId) {
        List<Team> teams = teamRepository.findByGuideUserId(guideUserId);
        List<CoordinatorProposalResponse> responses = new ArrayList<>();

        User guide = userRepository.findById(guideUserId).orElse(null);
        String guideName = (guide != null) ? guide.getFullName() : "Assigned Guide";
        String guideEmail = (guide != null) ? guide.getEmail() : "N/A";

        for (Team team : teams) {
            List<ProjectProposal> proposals = proposalRepository.findByTeamId(team.getTeamId());
            if (proposals == null || proposals.isEmpty()) continue;

            User leader = (team.getLeaderUserId() != null) ? userRepository.findById(team.getLeaderUserId()).orElse(null) : null;
            String leaderName = (leader != null) ? leader.getFullName() : "Team Leader";
            String leaderEmail = (leader != null) ? leader.getEmail() : "N/A";

            for (ProjectProposal proposal : proposals) {
                responses.add(new CoordinatorProposalResponse(
                        proposal.getProposalId(),
                        team.getTeamId(),
                        team.getTeamName(),
                        team.getTeamCode(),
                        leaderName,
                        leaderEmail,
                        guideUserId,
                        guideName,
                        guideEmail,
                        proposal.getTitle(),
                        proposal.getProjectDescription(),
                        proposal.getPdfFileName(),
                        proposal.getProposalStatus(),
                        proposal.getSubmittedAt()
                ));
            }
        }
        return responses;
    }

    public List<DepartmentStudentResponse> getAdvisedStudents(Long guideUserId) {
        List<Team> teams = teamRepository.findByGuideUserId(guideUserId);
        List<DepartmentStudentResponse> responses = new ArrayList<>();

        for (Team team : teams) {
            List<Student> students = studentRepository.findByTeamId(team.getTeamId());
            if (students == null) continue;

            for (Student student : students) {
                User user = userRepository.findById(student.getStudentUserId()).orElse(null);
                if (user == null) continue;

                boolean isLeader = (team.getLeaderUserId() != null && team.getLeaderUserId().equals(student.getStudentUserId()));
                responses.add(new DepartmentStudentResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getDepartment(),
                        team.getTeamId(),
                        team.getTeamName(),
                        team.getTeamCode(),
                        isLeader
                ));
            }
        }
        return responses;
    }
}