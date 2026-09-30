package com.pavanwagh.dashboard.controller;

import com.pavanwagh.dashboard.dto.AssignedTeamDetailResponse;
import com.pavanwagh.dashboard.dto.CoordinatorProposalResponse;
import com.pavanwagh.dashboard.dto.DepartmentStudentResponse;
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
        Long guideUserId = (Long) session.getAttribute("userId");
        if (guideUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        List<AssignedTeamDetailResponse> teams = guideService.getAssignedTeamsDetailed(guideUserId);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/all-proposals")
    public ResponseEntity<?> getAllGuideProposals(HttpSession session) {
        Long guideUserId = (Long) session.getAttribute("userId");
        if (guideUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        List<CoordinatorProposalResponse> proposals = guideService.getAllGuideProposals(guideUserId);
        return ResponseEntity.ok(proposals);
    }

    @GetMapping("/advised-students")
    public ResponseEntity<?> getAdvisedStudents(HttpSession session) {
        Long guideUserId = (Long) session.getAttribute("userId");
        if (guideUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        List<DepartmentStudentResponse> students = guideService.getAdvisedStudents(guideUserId);
        return ResponseEntity.ok(students);
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