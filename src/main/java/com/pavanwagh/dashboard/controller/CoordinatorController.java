package com.pavanwagh.dashboard.controller;

import com.pavanwagh.dashboard.dto.AssignGuideRequest;
import com.pavanwagh.dashboard.dto.GuideWithTeamCountResponse;
import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.service.CoordinatorService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/coordinator")
public class CoordinatorController {
    private final CoordinatorService coordinatorService;

    // Constructor Injection
    public CoordinatorController(CoordinatorService coordinatorService) {
        this.coordinatorService = coordinatorService;
    }


    // Assigns a guide to a team.
    @PostMapping("/assign_guide")
    public ResponseEntity<String> assignGuide(@RequestBody AssignGuideRequest request, HttpSession session) {
        Long coordinatorUserId = (Long) session.getAttribute("userId");
        if (coordinatorUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Coordinator is not logged in.");
        }

        if (request == null || request.getTeamId() == null || request.getGuideuserId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid team or guide information.");
        }

        return coordinatorService.assignGuide(coordinatorUserId, request.getTeamId(), request.getGuideuserId());
    }


    // Fetches all guides in the coordinator's department with their team counts.
    @GetMapping("/guides")
    public ResponseEntity<?> getAllGuides(HttpSession session) {
        Long coordinatorUserId = (Long) session.getAttribute("userId");
        if (coordinatorUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Coordinator is not logged in.");
        }

        List<GuideWithTeamCountResponse> guides = coordinatorService.getAllGuidesWithTeamCount(coordinatorUserId);
        return ResponseEntity.ok(guides);
    }


    // Fetches all unassigned teams in the coordinator's department.
    @GetMapping("/get_unassigned_teams")
    public ResponseEntity<List<Team>> getUnassignedTeams(HttpSession session) {
        Long coordinatorUserId = (Long) session.getAttribute("userId");
        if (coordinatorUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Team> teams = coordinatorService.getUnAssignedteams(coordinatorUserId);
        return ResponseEntity.ok(teams);
    }
}