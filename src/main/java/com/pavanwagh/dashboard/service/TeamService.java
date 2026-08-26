package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.dto.SubmitProposalRequest;
import com.pavanwagh.dashboard.entity.JoinRequest;
import com.pavanwagh.dashboard.entity.ProjectProposal;
import com.pavanwagh.dashboard.entity.Student;
import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.enums.ProposalStatus;
import com.pavanwagh.dashboard.enums.RequestStatus;
import com.pavanwagh.dashboard.repository.JoinRequestRepository;
import com.pavanwagh.dashboard.repository.ProposalRepository;
import com.pavanwagh.dashboard.repository.StudentRepository;
import com.pavanwagh.dashboard.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final StudentRepository studentRepository;
    private final ProposalRepository proposalRepository;

    // Constructor
    public TeamService(TeamRepository teamRepository, JoinRequestRepository joinRequestRepository, StudentRepository studentRepository, ProposalRepository proposalRepository) {
        this.teamRepository = teamRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.studentRepository = studentRepository;
        this.proposalRepository = proposalRepository;
    }


    // Create Team Code
    private String createTeamCode() {
        String str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        String teamCode;

        Random random = new Random();

        do {
            teamCode = "";
            for (int i = 1; i <= 8; i++) {
                teamCode += str.charAt(random.nextInt(str.length()));
            }
        } while (teamRepository.existsByTeamCode(teamCode));

        return teamCode;
    }


    // Create Team
    public String createTeam(String teamName, Student leader) {

        // Check team name
        if (teamName == null || teamName.trim().isEmpty()) {
            return "Enter team name.";
        }

        teamName = teamName.trim();

        // Check whether student is already in a team
        if (leader.getTeamId() != null) {
            return "You are already in a Team.";
        }

        // Create team
        Team team = new Team(teamName, createTeamCode(), leader.getStudentUserId());

        // Save team first so teamId is generated
        teamRepository.save(team);

        // Add the newly created team ID to the student
        leader.setTeamId(team.getTeamId());

        // Save updated student
        studentRepository.save(leader);

        return "Team Created Successfully.";
    }


    // Join Team
    public String joinTeam(Student student, String teamCode) {
        // Check if student is already in a team
        if (student.getTeamId() != null) {
            return "You are already in a Team.";
        }

        // Validate team code
        if (teamCode == null || teamCode.trim().isEmpty()) {
            return "Enter team code.";
        }

        teamCode = teamCode.trim().toUpperCase();


        // Check whether team exists
        if (!teamRepository.existsByTeamCode(teamCode)) {
            return "Invalid Teamcode.";
        }

        Team team = teamRepository.findByTeamCode(teamCode);

        // Check team capacity
        if (team.getCurrentMemberCount() >= 4) {
            return "Team is Full.";
        }

        // Check duplicate pending request
        if (joinRequestRepository.existsByStudentUserIdAndTeamIdAndRequestStatus(student.getStudentUserId(), team.getTeamId(), RequestStatus.PENDING)) {
            return "Join request already sent.";
        }

        // Create join request
        JoinRequest request = new JoinRequest(student.getStudentUserId(), team.getTeamId(), RequestStatus.PENDING);
        joinRequestRepository.save(request);

        return "Join request sent successfully.";
    }


    // Provide pending join requests to Team Leader
    public List<JoinRequest> getJoinRequests(Long teamId) {
        return joinRequestRepository.findByTeamIdAndRequestStatus(teamId, RequestStatus.PENDING);
    }

    // Accept or reject the join request
    public void respondToJoinRequest(int requestId, RequestStatus requestStatus) {
        JoinRequest request = joinRequestRepository.findById(requestId).orElse(null);

        if (request == null) {
            return;
        }

        // ACCEPT
        if (requestStatus == RequestStatus.ACCEPTED) {
            Student student = studentRepository.findById(request.getStudentUserId()).orElse(null);
            Team team = teamRepository.findById(request.getTeamId()).orElse(null);
            if (student == null || team == null) {
                return;
            }

            // Team became full while request was pending
            if (team.getCurrentMemberCount() >= 4) {
                return;
            }

            // Put student into the team
            student.setTeamId(team.getTeamId());
            studentRepository.save(student);

            // Increase team member count
            team.setCurrentMemberCount(team.getCurrentMemberCount() + 1);
            teamRepository.save(team);
        }

        // Change request status
        request.setRequestStatus(requestStatus);
        joinRequestRepository.save(request);
    }

    public List<Student> getTeamMembers(Long teamId) {
        return studentRepository.findByTeamId(teamId);
    }

    public String submitProposal(SubmitProposalRequest submitProposalRequest){
        ProjectProposal projectProposal=new ProjectProposal(submitProposalRequest.getTeamId(),
                submitProposalRequest.getTitle(),
                submitProposalRequest.getDescription(),
                submitProposalRequest.getFileName(),
                submitProposalRequest.getFilePath(),
                submitProposalRequest.getStatus()
        );

        proposalRepository.save(projectProposal);
        return "Proposal is submited";
    }
}