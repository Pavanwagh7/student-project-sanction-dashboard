package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.entity.Student;
import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class TeamService {
    private final TeamRepository teamRepository;

    // Constructor
    public TeamService (TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    private String createTeamCode() {
        String str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        String teamCode = "";

        Random random = new Random();
        do {
            teamCode = "";
            for (int i = 1; i <= 8; i++) {
                teamCode += str.charAt(random.nextInt(str.length()));
            }
        } while (teamRepository.existsByTeamCode(teamCode));

        return teamCode;
    }

    public void createTeam (String teamName, Student leader) {
        Team team = new Team(teamName, createTeamCode(),leader.getStudentUserId());
        teamRepository.save(team);
    }

    public void joinTeam (Student student, String teamCode) {

    }
}