package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.entity.Guide;
import com.pavanwagh.dashboard.entity.Team;
import com.pavanwagh.dashboard.repository.GuideRepository;
import com.pavanwagh.dashboard.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GuideService {

    private final GuideRepository guideRepository;
    private final TeamRepository teamRepository;

    public GuideService(GuideRepository guideRepository,
                        TeamRepository teamRepository) {
        this.guideRepository = guideRepository;
        this.teamRepository = teamRepository;
    }

    public List<Team> getAssignedTeams(Long guideUserId) {

        // Check whether guide exists
        Guide guide = guideRepository.findById(guideUserId).orElse(null);

        if (guide == null) {
            return List.of();
        }

        // Get teams assigned to this guide
        return teamRepository.findByGuideUserId(guideUserId);
    }
}