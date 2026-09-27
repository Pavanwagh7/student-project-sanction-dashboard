package com.pavanwagh.dashboard.controller;

import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.service.GuideService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.pavanwagh.dashboard.entity.ProjectProposal;
import java.util.List;

@RestController
@RequestMapping("/guide")
public class GuideController {

    private final GuideService guideService;

    public GuideController(GuideService guideService) {
        this.guideService = guideService;
    }

    @GetMapping("/assigned-teams")
    public ResponseEntity<?> getAssignedTeams(HttpSession session) {

        // Get logged-in user's ID from session
        Long guideUserId = (Long) session.getAttribute("userId");

        // Check login
        if (guideUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        List<Team> teams = guideService.getAssignedTeams(guideUserId);

        return ResponseEntity.ok(teams);
    }

    @PutMapping("/select-proposal/{proposalId}")
    public ResponseEntity<?> selectProposal(@PathVariable Long proposalId, HttpSession session) {

        Long guideUserId = (Long) session.getAttribute("userId");
        if (guideUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        ProjectProposal proposal = guideService.selectProposal(proposalId);

        if (proposal == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Proposal not found.");
        }

        return ResponseEntity.ok(proposal);
    }

    @PutMapping("/reject-proposal/{proposalId}")
    public ResponseEntity<?> rejectProposal(@PathVariable Long proposalId, HttpSession session) {

        Long guideUserId = (Long) session.getAttribute("userId");
        if (guideUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        ProjectProposal proposal = guideService.rejectProposal(proposalId);

        if (proposal == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Proposal not found.");
        }

        return ResponseEntity.ok(proposal);
    }

    @GetMapping("/team/{teamId}/proposals")
    public ResponseEntity<?> getTeamProposals(@PathVariable Long teamId, HttpSession session) {

        Long guideUserId = (Long) session.getAttribute("userId");
        if (guideUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        List<ProjectProposal> proposals = guideService.getTeamProposals(teamId);

        return ResponseEntity.ok(proposals);
    }
}