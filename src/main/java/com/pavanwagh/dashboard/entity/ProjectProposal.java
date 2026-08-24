package com.pavanwagh.dashboard.entity;

import com.pavanwagh.dashboard.enums.ProposalStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "project_proposals")
public class ProjectProposal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "proposal_id")
    private Long proposalId;

    @Column(name = "team_id")
    private Long teamId;

    @Column(name = "title")
     private String title;

    @Column(name = "project_description")
     private String projectDescription;

    @Column(name = "pdf_file_name")
     private String pdfFileName ;

    @Column(name = "pdf_file_path")
     private String pdfFilePath ;

    @Enumerated(EnumType.STRING)
    @Column(name = "proposal_status")
     private ProposalStatus proposalStatus ;

}
