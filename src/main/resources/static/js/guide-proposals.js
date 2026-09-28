const params = new URLSearchParams(window.location.search);
const teamId = params.get("teamId");
const container = document.getElementById("proposalsContainer");

/* =====================================================
   LOAD GUIDE PROFILE
   ===================================================== */
fetch("/users/me")
    .then(response => {
        if (!response.ok) {
            throw new Error("Unable to load guide profile");
        }
        return response.json();
    })
    .then(guide => {
        if (!guide) return;
        document.getElementById("profileName").innerText = guide.fullName;
        document.getElementById("profileInitial").innerText = guide.fullName.charAt(0).toUpperCase();
    })
    .catch(error => {
        console.error("Guide profile error:", error);
    });

/* =====================================================
   LOAD PROPOSALS
   ===================================================== */
if (!teamId) {
    container.innerHTML = `
        <div class="loading-card">
            Team ID was not provided.
        </div>
    `;
} else {
    fetch(`/guide/team/${teamId}/proposals`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to load proposals");
            }
            return response.json();
        })
        .then(proposals => {
            if (proposals.length === 0) {
                container.innerHTML = `
                    <div class="loading-card">
                        No proposals have been submitted by this team yet.
                    </div>
                `;
                return;
            }

            container.innerHTML = "";

            proposals.forEach(proposal => {
                const card = document.createElement("div");
                card.className = "proposal-card";

                let statusClass = "status-pending";
                if (proposal.proposalStatus === "ACCEPTED") {
                    statusClass = "status-accepted";
                } else if (proposal.proposalStatus === "SANCTIONED") {
                    statusClass = "status-accepted";
                } else if (proposal.proposalStatus === "REJECTED") {
                    statusClass = "status-rejected";
                }

                const isAccepted = proposal.proposalStatus === "ACCEPTED";
                const isSanctioned = proposal.proposalStatus === "SANCTIONED";
                const isRejected = proposal.proposalStatus === "REJECTED";

                card.innerHTML = `
                    <div class="proposal-top">
                        <div class="proposal-title">
                            <div class="proposal-icon">📋</div>
                            <div>
                                <h3>${escapeHtml(proposal.title)}</h3>
                                <span class="proposal-id">Proposal #${proposal.proposalId}</span>
                            </div>
                        </div>
                        <span class="status ${statusClass}">
                            ${proposal.proposalStatus}
                        </span>
                    </div>

                    <p class="proposal-description">
                        ${escapeHtml(proposal.projectDescription)}
                    </p>

                    <div class="proposal-details">
                        <div class="proposal-detail">
                            <span>Team ID</span>
                            <strong>${proposal.teamId}</strong>
                        </div>
                        <div class="proposal-detail">
                            <span>Submitted At</span>
                            <strong>${proposal.submittedAt || "Not available"}</strong>
                        </div>
                    </div>

                    <!-- Faculty PDF Synopsis Box with View & Download -->
                    <div class="proposal-pdf-box">
                        <div class="pdf-info">
                            <span class="pdf-icon">📄</span>
                            <span class="pdf-name" title="${escapeHtml(proposal.pdfFileName || 'Project_Synopsis.pdf')}">
                                ${escapeHtml(proposal.pdfFileName || 'Project_Synopsis.pdf')}
                            </span>
                        </div>
                        <div class="pdf-btn-group">
                            <a href="/project/view/${proposal.proposalId}" target="_blank" class="pdf-btn pdf-btn-view" title="Open PDF in new tab">
                                👁️ View PDF
                            </a>
                            <a href="/project/download/${proposal.proposalId}" class="pdf-btn pdf-btn-download" title="Download PDF synopsis">
                                ⬇️ Download
                            </a>
                        </div>
                    </div>

                    <!-- SELECT / REJECT BUTTONS -->
                    <div class="proposal-actions">
                        <button
                            class="select-btn"
                            onclick="selectProposal(${proposal.proposalId})"
                            ${isAccepted || isSanctioned || isRejected ? "disabled" : ""}>
                            ${isSanctioned ? "🏆 Project Sanctioned" : (isAccepted ? "✓ Selected (Sent to Coordinator)" : "Select Proposal")}
                        </button>

                        <button
                            class="reject-btn"
                            onclick="rejectProposal(${proposal.proposalId})"
                            ${isAccepted || isSanctioned || isRejected ? "disabled" : ""}>
                            ${isRejected ? "✕ Proposal Rejected" : "Reject Proposal"}
                        </button>
                    </div>
                `;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Proposal error:", error);
            container.innerHTML = `
                <div class="loading-card">
                    Unable to load proposals.
                </div>
            `;
        });
}

/* =====================================================
   SELECT PROPOSAL
   ===================================================== */
function selectProposal(proposalId) {
    if (!confirm("Are you sure you want to select this proposal?")) {
        return;
    }

    fetch(`/guide/select-proposal/${proposalId}`, {
        method: "PUT"
    })
    .then(response => {
        if (!response.ok) throw new Error("Unable to select proposal");
        return response.json();
    })
    .then(() => {
        alert("Proposal selected successfully and forwarded to Coordinator.");
        location.reload();
    })
    .catch(error => {
        console.error("Selection error:", error);
        alert("Failed to select proposal.");
    });
}

/* =====================================================
   REJECT PROPOSAL
   ===================================================== */
function rejectProposal(proposalId) {
    if (!confirm("Are you sure you want to reject this proposal?")) {
        return;
    }

    fetch(`/guide/reject-proposal/${proposalId}`, {
        method: "PUT"
    })
    .then(response => {
        if (!response.ok) throw new Error("Unable to reject proposal");
        return response.json();
    })
    .then(() => {
        alert("Proposal rejected successfully.");
        location.reload();
    })
    .catch(error => {
        console.error("Rejection error:", error);
        alert("Failed to reject proposal.");
    });
}

/* =====================================================
   BACK TO DASHBOARD & LOGOUT
   ===================================================== */
function goBack() {
    window.location.href = "/guide-dashboard.html";
}

function logout() {
    fetch("/users/logout", { method: "POST" })
        .then(() => { window.location.href = "/login.html"; })
        .catch(error => {
            console.error("Logout error:", error);
            window.location.href = "/login.html";
        });
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}