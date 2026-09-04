package com.pavanwagh.dashboard.controller;

import com.pavanwagh.dashboard.dto.JoinRequestResponse;
import com.pavanwagh.dashboard.dto.JoinTeamRequest;
import com.pavanwagh.dashboard.dto.SubmitProposalRequest;
import com.pavanwagh.dashboard.dto.TeamRequest;
import com.pavanwagh.dashboard.entity.JoinRequest;
import com.pavanwagh.dashboard.entity.Student;
import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.entity.User;
import com.pavanwagh.dashboard.enums.ProposalStatus;
import com.pavanwagh.dashboard.repository.StudentRepository;
import com.pavanwagh.dashboard.repository.TeamRepository;
import com.pavanwagh.dashboard.repository.UserRepository;
import com.pavanwagh.dashboard.service.TeamService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/my_team")
public class TeamController {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeamService teamService;

    // Constructor
    public TeamController(StudentRepository studentRepository, TeamRepository teamRepository, UserRepository userRepository, TeamService teamService) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teamService = teamService;
    }

    @GetMapping("/get_team_members")
    public ResponseEntity<?> getTeamMembers(Long teamId) {
        List<Student> teamMembers = teamService.getTeamMembers(teamId);
        if (teamMembers.isEmpty()) {
            return ResponseEntity.ok("No members added yet.");
        }

        return ResponseEntity.ok(teamMembers);
    }

    @PostMapping("/respond_to_join_request")
    public String respondToJoinRequest(@RequestBody JoinRequestResponse request) {
        teamService.respondToJoinRequest(request.getRequestId(), request.getRequestStatus());

        return "Request processed successfully.";
    }


    @PostMapping("/join")
    public String joinTeam(@RequestBody JoinTeamRequest request, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return "User is not logged in.";
        }
        Student student = studentRepository.findById(userId).orElse(null);
        if (student == null) {
            return "Student record not found.";
        }

        return teamService.joinTeam(student, request.getTeamCode());
    }


    // Get Team Details
    @GetMapping("/details")
    public ResponseEntity<?> getTeamDetails(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        // Find logged-in student's record
        Student student = studentRepository.findById(userId).orElse(null);

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student record not found.");
        }

        // Check whether student belongs to a team
        Long teamId = student.getTeamId();

        if (teamId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("You are not part of any team.");
        }

        // Find the team using teamId
        Team team = teamRepository.findById(teamId).orElse(null);

        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Team not found.");
        }

        // Find team leader
        User leader = userRepository.findById(team.getLeaderUserId()).orElse(null);

        if (leader == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Team leader not found.");
        }

        Map<String, Object> teamDetails = Map.of(
                "teamId", team.getTeamId(),
                "teamName", team.getTeamName(),
                "teamCode", team.getTeamCode(),
                "leaderName", leader.getFullName() );

        return ResponseEntity.ok(teamDetails);
    }


    // Create Team
    @PostMapping("/create")
    public String createTeam(@RequestBody TeamRequest request, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return "User is not logged in.";
        }

        Student leader = studentRepository.findById(userId).orElse(null);
        if (leader == null) {
            return "Student record not found.";
        }

        return teamService.createTeam(request.getTeamName(), leader);
    }


    // Get Pending Join Requests
    @PostMapping("/get_join_request_list")
    public List<JoinRequest> getJoinRequests(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return List.of();
        }

        Team team = teamRepository.findByLeaderUserId(userId);
        if (team == null) {
            return List.of();
        }
        Long teamId = team.getTeamId();

        return teamService.getJoinRequests(teamId);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getTeamStatus(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        Student student = studentRepository.findById(userId).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student record not found.");
        }

        return ResponseEntity.ok(Map.of("inTeam", student.getTeamId() != null));
    }
    @PostMapping("/submit_proposal")
    public ResponseEntity<String> sumbitProposal(@RequestBody SubmitProposalRequest submitProposalRequest,HttpSession session){
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

        return teamService.submitProposal(submitProposalRequest);
    }
}