package com.pavanwagh.dashboard.repository;

import com.pavanwagh.dashboard.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team,Long> {
    // Count teams assigned to a guide
    long countByGuideUserId(Long guideUserId);

    boolean existsByTeamCode(String teamCode);

    Team findByTeamCode(String teamCode);

    Team findByLeaderUserId(Long leaderUserId);

    @Query("SELECT t FROM Team t, User u " +
            "WHERE t.leaderUserId = u.id " +
            "AND t.guideUserId IS NULL " +
            "AND LOWER(u.department) = LOWER(:department)")
    List<Team> findUnassignedTeamsByDepartment(@Param("department") String department);


    List<Team> findByGuideUserId(Long guideUserId);

}
