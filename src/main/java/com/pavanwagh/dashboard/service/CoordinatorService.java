package com.pavanwagh.dashboard.service;

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


    // Assigns a faculty guide to a student team with full validation and department isolation.
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

        // Check if Team already has a Guide assigned
        if (team.getGuideUserId() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("A guide is already assigned to this team.");
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
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Guide " + guideUser.getFullName() + " belongs to "+ guideUser.getDepartment() + ", not " + coordinatorDept + ".");
        }

        // Assign and Save
        team.setGuideUserId(guideUserId);
        teamRepository.save(team);

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
}