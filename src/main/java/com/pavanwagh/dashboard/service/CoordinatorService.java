package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.dto.AssignedTeamDetailResponse;
import com.pavanwagh.dashboard.dto.GuideWithTeamCountResponse;
import com.pavanwagh.dashboard.entity.Guide;
import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.entity.User;
import com.pavanwagh.dashboard.repository.GuideRepository;
import com.pavanwagh.dashboard.repository.TeamRepository;
import com.pavanwagh.dashboard.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CoordinatorService {

    private final TeamRepository teamRepository;
    private final GuideRepository guideRepository;
    private final UserRepository userRepository;

    // Constructor Injection
    public CoordinatorService(TeamRepository teamRepository, GuideRepository guideRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.guideRepository = guideRepository;
        this.userRepository = userRepository;
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
}