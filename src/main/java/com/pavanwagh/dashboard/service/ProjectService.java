package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.dto.SubmitProposalRequest;
import com.pavanwagh.dashboard.entity.ProjectProposal;
import com.pavanwagh.dashboard.repository.ProposalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.net.MalformedURLException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class ProjectService {
    private static final String DEFAULT_UPLOAD_DIR = "uploads/proposals/";

    private final ProposalRepository proposalRepository;

    // Constructor
    public ProjectService(ProposalRepository proposalRepository) {
        this.proposalRepository = proposalRepository;
    }

    public ResponseEntity<String> submitProposal(MultipartFile file, SubmitProposalRequest submitProposalRequest){
        // Enforce 3-proposal limit
        long proposalCount = proposalRepository.countByTeamId(submitProposalRequest.getTeamId());
        if (proposalCount >= 3) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You can submit maximum 3 proposals.");
        }

        String uploadDirPath = submitProposalRequest.getFilePath();
        if (uploadDirPath == null || uploadDirPath.trim().isEmpty()) {
            uploadDirPath = DEFAULT_UPLOAD_DIR;
        }

        // Resolve to absolute path on disk (bypasses Tomcat temp directory trap)
        Path uploadPath = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        }
        catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create upload directory on server.");
        }

        // Collision-proof unique filename
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.trim().isEmpty()) {
            originalName = "proposal.pdf";
        }
        String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFileName = "team_" + submitProposalRequest.getTeamId() + "_" + System.currentTimeMillis() + "_" + cleanName;

        Path destinationPath = uploadPath.resolve(uniqueFileName);

        // Save file to disk using Java NIO stream
        try {
            Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
        }
        catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unable to save file on server.");
        }

        // Save entity with absolute directory path
        ProjectProposal projectProposal = new ProjectProposal(submitProposalRequest.getTeamId(), submitProposalRequest.getTitle(), submitProposalRequest.getDescription(), uniqueFileName, uploadPath.toString() + File.separator, submitProposalRequest.getStatus());
        proposalRepository.save(projectProposal);
        return ResponseEntity.status(HttpStatus.CREATED).body("Proposal is submited");
    }

    public ResponseEntity<String> deleteProposal(Long proposalId, Long teamId) {
        ProjectProposal proposal = proposalRepository.findById(proposalId).orElse(null);
        if (proposal == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Proposal not found.");
        }
        if (!proposal.getTeamId().equals(teamId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to delete this proposal.");
        }

        File file = new File(proposal.getPdfFilePath() + proposal.getPdfFileName());
        if (file.exists()) {
            file.delete();
        }

        proposalRepository.deleteById(proposalId);
        return ResponseEntity.ok("Proposal deleted successfully.");
    }

    public List<ProjectProposal> getTeamProposals(Long teamId) {
        return proposalRepository.findByTeamId(teamId);
    }

    public ResponseEntity<Resource> servePdf(Long proposalId, String dispositionType) {
        ProjectProposal proposal = proposalRepository.findById(proposalId).orElse(null);
        if (proposal == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        try {
            // Check stored path first, fallback to default upload directory
            File file = new File(proposal.getPdfFilePath() + proposal.getPdfFileName());
            if (!file.exists()) {
                file = new File(DEFAULT_UPLOAD_DIR + proposal.getPdfFileName());
            }
            if (!file.exists() || !file.canRead()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            Resource resource = new UrlResource(file.toURI());
            String disposition = "inline".equalsIgnoreCase(dispositionType) ? "inline" : "attachment";
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + proposal.getPdfFileName() + "\"").header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate").body(resource);
        }
        catch (MalformedURLException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
