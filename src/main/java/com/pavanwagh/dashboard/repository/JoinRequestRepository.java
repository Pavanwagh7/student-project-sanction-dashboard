package com.pavanwagh.dashboard.repository;

import com.pavanwagh.dashboard.entity.JoinRequest;
import com.pavanwagh.dashboard.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JoinRequestRepository extends JpaRepository<JoinRequest,Integer> {

    // ArrayList<JoinRequest> findByTeamIdAndRequestStatus(Long teamId, String pending);

    List<JoinRequest> findByTeamIdAndRequestStatus(Long teamId, RequestStatus requestStatus);

    boolean existsByStudentUserIdAndTeamIdAndRequestStatus(Long studentUserId, Long teamId, RequestStatus requestStatus);
}



