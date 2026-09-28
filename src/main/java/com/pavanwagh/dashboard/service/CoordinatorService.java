package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.dto.AssignedTeamDetailResponse;
import com.pavanwagh.dashboard.dto.CoordinatorProposalResponse;
import com.pavanwagh.dashboard.dto.DepartmentStudentResponse;
import com.pavanwagh.dashboard.dto.GuideWithTeamCountResponse;
import com.pavanwagh.dashboard.entity.*;
import com.pavanwagh.dashboard.enums.ProposalStatus;
import com.pavanwagh.dashboard.enums.RoleEnum;
import com.pavanwagh.dashboard.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CoordinatorService {
    private final TeamRepository teamRepository;
    private final GuideRepository guideRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ProposalRepository proposalRepository;
    private final ProjectRepository projectRepository;


    // Constructor Injection
    public CoordinatorService(TeamRepository teamRepository, GuideRepository guideRepository, UserRepository userRepository, StudentRepository studentRepository, ProposalRepository proposalRepository, ProjectRepository projectRepository) {
        this.teamRepository = teamRepository;
        this.guideRepository = guideRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.proposalRepository = proposalRepository;
        this.projectRepository = projectRepository;
    }


    // Assigns or Reassigns a faculty guide to a student team with full validation and department isolation.
    @Transactional
    public ResponseEntity<String> assignGuide(Long coordinatorUserId, Long teamId, Long guideUserId) {

        // Basic Parameter Null Checks
        if (coordinatorUserId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid coordinator ID.");
        }
        if (teamId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid team ID.");
        }
        if (guideUserId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid guide user ID.");
        }

        // Fetch and Verify Coordinator
        User coordinator = userRepository.findById(coordinatorUserId).orElse(null);
        if (coordinator == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Coordinator not found.");
        }

        // Fetch and Verify Guide
        User guideUser = userRepository.findById(guideUserId).orElse(null);
        Guide guide = guideRepository.findById(guideUserId).orElse(null);
        if (guideUser == null || guide == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Guide not found.");
        }

        // Fetch and Verify Team
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Team not found.");
        }

        // Check if the team is already assigned to this EXACT SAME guide
        if (team.getGuideUserId() != null && team.getGuideUserId().equals(guideUserId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Guide " + guideUser.getFullName() + " is already assigned to " + team.getTeamName() + ".");
        }

        // Fetch Team Leader to verify Team's Department
        User leader = userRepository.findById(team.getLeaderUserId()).orElse(null);
        if (leader == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Team leader not found.");
        }

        // Department Isolation Checks
        String coordinatorDept = coordinator.getDepartment();

        if (coordinatorDept == null || !coordinatorDept.equalsIgnoreCase(leader.getDepartment())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: This team belongs to " + leader.getDepartment() + ", not " + coordinatorDept + ".");
        }

        if (!coordinatorDept.equalsIgnoreCase(guideUser.getDepartment())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Guide " + guideUser.getFullName() + " belongs to " + guideUser.getDepartment() + ", not " + coordinatorDept + ".");
        }

        // Check if this is an initial assignment or a reassignment
        boolean isReassignment = (team.getGuideUserId() != null);

        // Assign and Save
        team.setGuideUserId(guideUserId);
        teamRepository.save(team);

        if (isReassignment) {
            return ResponseEntity.ok("Guide reassigned successfully to " + guideUser.getFullName() + " for team " + team.getTeamName() + ".");
        }

        return ResponseEntity.ok("Guide assigned successfully to " + team.getTeamName() + ".");
    }

    // Returns a list of guides belonging strictly to the coordinator's department,
    // along with their currently assigned team count.
    public List<GuideWithTeamCountResponse> getAllGuidesWithTeamCount(Long coordinatorUserId) {

        User coordinator = userRepository.findById(coordinatorUserId).orElse(null);
        if (coordinator == null || coordinator.getDepartment() == null) {
            return List.of();
        }

        String coordinatorDept = coordinator.getDepartment();
        List<Guide> guides = guideRepository.findAll();
        List<GuideWithTeamCountResponse> response = new ArrayList<>(); // New ArrayList created

        for (Guide guide : guides) {
            Long guideUserId = guide.getGuideUserID();

            User user = userRepository.findById(guideUserId).orElse(null);
            if (user == null) {
                continue;
            }

            // Department Filter: Only include guides in coordinator's department
            if (!coordinatorDept.equalsIgnoreCase(user.getDepartment())) {
                continue;
            }

            long teamCount = teamRepository.countByGuideUserId(guideUserId);
            GuideWithTeamCountResponse guideResponse = new GuideWithTeamCountResponse(user.getId(), user.getFullName(), user.getEmail(), user.getDepartment(), teamCount);

            response.add(guideResponse);
        }

        return response;
    }

    // Returns all unassigned teams belonging strictly to the coordinator's department.
    public List<Team> getUnAssignedteams(Long coordinatorUserId) {
        User coordinator = userRepository.findById(coordinatorUserId).orElse(null);
        if (coordinator == null || coordinator.getDepartment() == null) {
            return List.of();
        }

        return teamRepository.findUnassignedTeamsByDepartment(coordinator.getDepartment());
    }

    public List<AssignedTeamDetailResponse> getAssignedTeams(Long coordinatorUserId) {
        User coordinator = userRepository.findById(coordinatorUserId).orElse(null);
        if (coordinator == null || coordinator.getDepartment() == null) return List.of();

        String coordinatorDept = coordinator.getDepartment();
        List<Team> assignedTeams = teamRepository.findAssignedTeamsByDepartment(coordinatorDept);

        List<AssignedTeamDetailResponse> responses = new ArrayList<>();

        for (Team team : assignedTeams) {
            Long teamId = team.getTeamId();
            String teamName = team.getTeamName();
            String teamCode = team.getTeamCode();
            int currentTeamCount = team.getCurrentMemberCount();

            Long leaderUserId = team.getLeaderUserId();
            User leader = userRepository.findById(leaderUserId).orElse(null);
            String leaderName = (leader != null) ? leader.getFullName() : "Unknown Leader";
            String leaderEmail = (leader != null) ? leader.getEmail() : "N/A";

            Long guideId = team.getGuideUserId();
            User guide = userRepository.findById(guideId).orElse(null);
            String guideName = (guide != null) ? guide.getFullName() : "Not Allocated";
            String guideEmail = (guide != null) ? guide.getEmail() : "N/A";

            AssignedTeamDetailResponse response = new AssignedTeamDetailResponse(teamId,teamName,teamCode,currentTeamCount,leaderUserId,leaderName,leaderEmail,guideId,guideName,guideEmail);
            responses.add(response);
        }

        return  responses;
    }

    // Get all the students from the department
    public List<DepartmentStudentResponse> getAllStudentsFromDepartment(Long coordinatorId) {
        User coordinator = userRepository.findById(coordinatorId).orElse(null);
        if (coordinator == null) return null;
        String department = coordinator.getDepartment();

        List<DepartmentStudentResponse> responses = new ArrayList<>();

        // Fetch all students in coordinator's department
        List<User> students = userRepository.findByDepartmentAndRole(department, RoleEnum.STUDENT);

        for (User user : students) {
            if (user == null) continue;
            Long userId = user.getId();
            String fullName = user.getFullName();
            String email = user.getEmail();
            String currentDepartment = user.getDepartment();

            Student student = studentRepository.findById(userId).orElse(null);
            Long teamId = (student != null) ? student.getTeamId() : null;

            String teamName = null;
            String teamCode = null;
            boolean isLeader = false;

            // Only look up team if student has actually joined one!
            if (teamId != null) {
                Team team = teamRepository.findById(teamId).orElse(null);
                if (team != null) {
                    teamName = team.getTeamName();
                    teamCode = team.getTeamCode();
                    // Only true if THIS student is the leader
                    isLeader = (team.getLeaderUserId() != null && team.getLeaderUserId().equals(userId));
                }
            }

            // Added to list regardless of whether they have a team or not!
            DepartmentStudentResponse response = new DepartmentStudentResponse(userId, fullName, email, currentDepartment, teamId, teamName, teamCode, isLeader);
            responses.add(response);
        }

        return responses;
    }


    // GET ALL GUIDE-ACCEPTED & SANCTIONED PROPOSALS
    public List<CoordinatorProposalResponse> getDepartmentAcceptedProposals(Long coordinatorUserId) {
        User coordinator = userRepository.findById(coordinatorUserId).orElse(null);
        if (coordinator == null) return null;
        String department = coordinator.getDepartment();

        List<CoordinatorProposalResponse> responses = new ArrayList<>();
        List<Team> allTeams = teamRepository.findAll();

        for (Team team : allTeams) {
            if (team == null || team.getLeaderUserId() == null) continue;

            // Department Isolation Check
            User leader = userRepository.findById(team.getLeaderUserId()).orElse(null);
            if (leader == null || !department.equalsIgnoreCase(leader.getDepartment())) {
                continue;
            }

            List<ProjectProposal> proposals = proposalRepository.findByTeamId(team.getTeamId());
            if (proposals == null || proposals.isEmpty()) continue;

            // Guide Details
            String guideName = "Not Assigned";
            String guideEmail = "N/A";
            Long guideUserId = team.getGuideUserId();
            if (guideUserId != null) {
                User guide = userRepository.findById(guideUserId).orElse(null);
                if (guide != null) {
                    guideName = guide.getFullName();
                    guideEmail = guide.getEmail();
                }
            }

            for (ProjectProposal proposal : proposals) {
                // Show proposals accepted by guide or officially sanctioned
                if (proposal.getProposalStatus() == ProposalStatus.ACCEPTED || proposal.getProposalStatus() == ProposalStatus.SANCTIONED) {
                    CoordinatorProposalResponse resp = new CoordinatorProposalResponse(proposal.getProposalId(), team.getTeamId(), team.getTeamName(), team.getTeamCode(), leader.getFullName(), leader.getEmail(), guideUserId, guideName, guideEmail, proposal.getTitle(), proposal.getProjectDescription(), proposal.getPdfFileName(), proposal.getProposalStatus(), proposal.getSubmittedAt());
                    responses.add(resp);
                }
            }
        }
        return responses;
    }


    public ResponseEntity<String> sanctionProject(Long coordinatorUserId, Long proposalId) {
        Optional<ProjectProposal> proposalOpt = proposalRepository.findById(proposalId);
        if (proposalOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Proposal not found.");
        }

        ProjectProposal proposal = proposalOpt.get();

        if (proposal.getProposalStatus() != ProposalStatus.ACCEPTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Only guide-accepted proposals can be sanctioned.");
        }

        // Update proposal status
        proposal.setProposalStatus(ProposalStatus.SANCTIONED);
        proposalRepository.save(proposal);

        // Generate Official Sanction Record in projects table
        if (!projectRepository.existsByProposalId(proposalId)) {
            Team team = teamRepository.findById(proposal.getTeamId()).orElse(null);
            Project project = new Project();
            project.setSanctionNumber("SANCTION-2026-" + proposal.getTeamId() + "-" + proposal.getProposalId());
            project.setTeamId(proposal.getTeamId());
            project.setGuideId(team != null ? team.getGuideUserId() : null);
            project.setProposalId(proposal.getProposalId());
            project.setProjectTitle(proposal.getTitle());
            project.setSanctionedAt(java.time.LocalDateTime.now());
            projectRepository.save(project);
        }

        return ResponseEntity.ok("Project successfully sanctioned with official stamp!");
    }
}