package com.pavanwagh.dashboard.controller;

import com.pavanwagh.dashboard.dto.SubmitProposalRequest;
import com.pavanwagh.dashboard.entity.Student;
import com.pavanwagh.dashboard.enums.ProposalStatus;
import com.pavanwagh.dashboard.repository.StudentRepository;
import com.pavanwagh.dashboard.service.ProjectService;
import com.pavanwagh.dashboard.service.TeamService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/project")
public class ProjectController {
    private final TeamService teamService;
    private final StudentRepository studentRepository;
    private final ProjectService projectService;

    // Constructor
    public ProjectController(TeamService teamService, StudentRepository studentRepository, ProjectService projectService) {
        this.teamService = teamService;
        this.studentRepository = studentRepository;
        this.projectService = projectService;
    }

    @PostMapping("/submit_proposal")
    public ResponseEntity<String> sumbitProposal(@RequestBody SubmitProposalRequest submitProposalRequest, HttpSession session){
        if (submitProposalRequest == null) {
            return ResponseEntity.badRequest().body("Invalid Proposal Request.");
        }

        // Check if all received inputs are valid
        if(submitProposalRequest.getTitle() == null || submitProposalRequest.getTitle().isEmpty()){
            return ResponseEntity.badRequest().body("Title field is empty.");
        }
        if(submitProposalRequest.getDescription() == null || submitProposalRequest.getDescription().isEmpty()){
            return ResponseEntity.badRequest().body("Description field is empty.");
        }
        if(submitProposalRequest.getFilePath() == null || submitProposalRequest.getFilePath().isEmpty()){
            return ResponseEntity.badRequest().body("File path field is empty.");
        }
        if(submitProposalRequest.getFileName() == null || submitProposalRequest.getFileName().isEmpty()){
            return ResponseEntity.badRequest().body("File Name field is empty.");
        }

        // Get the Logged in Student
        Long studentId = (Long) session.getAttribute("userId");
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User is not logged in.");
        }

        // Get teamId from Student
        Long teamId = student.getTeamId();
        if(teamId == null){
            return ResponseEntity.badRequest().body("You are not a part of any team.");
        }

        // Set backend-controlled values
        submitProposalRequest.setStatus(ProposalStatus.PENDING);
        submitProposalRequest.setTeamId(teamId);

        return projectService.submitProposal(submitProposalRequest);
    }
}
