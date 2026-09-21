package com.pavanwagh.dashboard.service;


import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.repository.GuideRepository;
import com.pavanwagh.dashboard.repository.TeamRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class CoordinatorService {
    private final TeamRepository teamRepository;
    private final GuideRepository guideRepository;

    // Constructor
    public CoordinatorService(TeamRepository teamRepository, GuideRepository guideRepository) {
        this.teamRepository = teamRepository;
        this.guideRepository = guideRepository;
    }

    public ResponseEntity<String> assignGuide (Long guideUserId, Long teamId) {
        if (teamId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid team id.");
        if (guideUserId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid guide User Id.");

        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Team not found");
        }
        if(team.getGuideUserId() == null) {
            // You can assign guide
            team.setGuideUserId(guideUserId);
            return ResponseEntity.ok().body("Guide assigned successfully.");
        }
        else {
            // guide already assigned
            return ResponseEntity.ok().body("Already Assigned");
        }
    }
}
