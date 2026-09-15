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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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
    public ResponseEntity<String> sumbitProposal(@RequestParam("file")MultipartFile file, @ModelAttribute SubmitProposalRequest submitProposalRequest, HttpSession session){

        if (submitProposalRequest == null) {
            return ResponseEntity.badRequest().body("Invalid Proposal Request.");
        }
        if (file == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File not found.");

        if (file.isEmpty()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty.");

        // Check if all received inputs are valid in submitProposalRequest
        if(submitProposalRequest.getTitle() == null || submitProposalRequest.getTitle().isEmpty()){
            return ResponseEntity.badRequest().body("Title field is empty.");
        }

        if(submitProposalRequest.getDescription() == null || submitProposalRequest.getDescription().isEmpty()){
            return ResponseEntity.badRequest().body("Description field is empty.");
        }

        //Actual file Validation
        if (file.getOriginalFilename() == null || file.getOriginalFilename().isEmpty()) {
            return ResponseEntity.badRequest().body("File name is empty.");
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
        submitProposalRequest.setFileName(file.getOriginalFilename());
        submitProposalRequest.setFilePath("D://Programming//file_upload//file_store//");

        return projectService.submitProposal(file,submitProposalRequest);
    }

    @GetMapping("/my_proposals")
    public ResponseEntity<?> getMyProposals(HttpSession session) {
        Long studentId = (Long) session.getAttribute("userId");

        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        Student student = studentRepository.findById(studentId).orElse(null);

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student record not found.");
        }

        Long teamId = student.getTeamId();

        if (teamId == null) {
            return ResponseEntity.badRequest().body("You are not a part of any team.");
        }

        return ResponseEntity.ok(projectService.getTeamProposals(teamId));
    }
}
