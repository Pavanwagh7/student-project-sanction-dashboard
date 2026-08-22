package com.pavanwagh.dashboard.repository;

import com.pavanwagh.dashboard.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team,Long> {
    boolean existsByTeamCode(String teamCode);

    Team findByTeamCode(String teamCode);

    Team findByLeaderUserId(Long leaderUserId);
}
