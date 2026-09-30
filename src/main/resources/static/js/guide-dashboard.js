// =====================================================
// PROJSETU GUIDE MODULE
// State Management & Reactive Data Stream
// =====================================================

let state = {
    guide: null,
    teams: [],
    proposals: [],
    students: [],
    teamFilter: "all",
    teamSearch: "",
    proposalFilter: "all",
    proposalSearch: "",
    proposalTeamId: "all",
    studentFilter: "all",
    studentSearch: "",
    studentTeamId: "all",
    selectedProposalForAction: null
};

// =====================================================
// 1. INITIALIZATION ON DOM READY
// =====================================================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadGuideProfile();

        await Promise.all([
            loadAssignedTeams(),
            loadAllProposals(),
            loadAdvisedStudents()
        ]);

        populateTeamSelects();
        updateStatsOverview();

        // Check if a teamId was passed in query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const queryTeamId = urlParams.get("teamId");
        if (queryTeamId) {
            state.proposalTeamId = queryTeamId;
            const selectEl = document.getElementById("proposalTeamSelect");
            if (selectEl) selectEl.value = queryTeamId;
            // Scroll to proposals section
            const propSec = document.getElementById("proposalsSection");
            if (propSec) propSec.scrollIntoView({ behavior: "smooth" });
        }

        renderTeamsTable();
        renderProposalsTable();
        renderStudentsTable();
        renderSanctionsTable();

        setupNavScrollSpy();

    } catch (err) {
        console.error("Guide dashboard initialization error:", err);
    }
});

// =====================================================
// 2. LOAD GUIDE PROFILE
// =====================================================
async function loadGuideProfile() {
    try {
        const response = await fetch("/users/me");
        if (!response.ok) throw new Error("Unauthorized");

        state.guide = await response.json();

        const name = state.guide.fullName || "Faculty Mentor";
        document.getElementById("guideName").innerText = name;
        document.getElementById("profileName").innerText = name;
        document.getElementById("guideDeptBadge").innerText = `${state.guide.department || "Faculty"} Mentor`;
        document.getElementById("profileInitial").innerText = name.charAt(0).toUpperCase();

    } catch (error) {
        console.error("Failed to load profile:", error);
        window.location.href = "/login.html";
    }
}

// =====================================================
// 3. LOAD ASSIGNED TEAMS
// =====================================================
async function loadAssignedTeams() {
    try {
        const response = await fetch("/guide/assigned-teams");
        if (!response.ok) throw new Error("Unable to fetch assigned teams");

        state.teams = await response.json();
    } catch (error) {
        console.error("Assigned teams load error:", error);
        state.teams = [];
    }
}

// =====================================================
// 4. LOAD ALL PROPOSALS ACROSS ASSIGNED TEAMS
// =====================================================
async function loadAllProposals() {
    try {
        const response = await fetch("/guide/all-proposals");
        if (!response.ok) throw new Error("Unable to fetch guide proposals");

        state.proposals = await response.json();
    } catch (error) {
        console.error("All proposals load error:", error);
        state.proposals = [];
    }
}

// =====================================================
// 5. LOAD ADVISED STUDENTS (MENTEES)
// =====================================================
async function loadAdvisedStudents() {
    try {
        const response = await fetch("/guide/advised-students");
        if (!response.ok) throw new Error("Unable to fetch advised students");

        state.students = await response.json();
    } catch (error) {
        console.error("Advised students load error:", error);
        state.students = [];
    }
}

// =====================================================
// 6. POPULATE TEAM DROPDOWNS & OVERVIEW STATS
// =====================================================
function populateTeamSelects() {
    const propSelect = document.getElementById("proposalTeamSelect");
    const studSelect = document.getElementById("studentTeamSelect");

    if (propSelect) {
        propSelect.innerHTML = `<option value="all">All Assigned Teams (${state.teams.length})</option>`;
        state.teams.forEach(t => {
            propSelect.innerHTML += `<option value="${t.teamId}">${escapeHtml(t.teamName)} (${t.teamCode})</option>`;
        });
    }

    if (studSelect) {
        studSelect.innerHTML = `<option value="all">All Assigned Teams (${state.teams.length})</option>`;
        state.teams.forEach(t => {
            studSelect.innerHTML += `<option value="${t.teamId}">${escapeHtml(t.teamName)} (${t.teamCode})</option>`;
        });
    }
}

function updateStatsOverview() {
    const totalTeams = state.teams.length;
    const totalStudents = state.students.length;
    const totalProposals = state.proposals.length;
    const pendingProposals = state.proposals.filter(p => p.proposalStatus === "PENDING").length;
    const sanctionedProjects = state.proposals.filter(p => p.proposalStatus === "SANCTIONED").length;

    document.getElementById("statAssignedTeams").innerText = totalTeams;
    document.getElementById("teamsTotalBadge").innerText = `${totalTeams} Teams`;

    document.getElementById("statAdvisedStudents").innerText = totalStudents;
    document.getElementById("studentsTotalBadge").innerText = `${totalStudents} Mentees`;

    document.getElementById("statTotalProposals").innerText = totalProposals;
    document.getElementById("proposalsTotalBadge").innerText = `${totalProposals} Proposals`;

    const pendingEl = document.getElementById("statPendingProposals");
    if (pendingEl) pendingEl.innerText = pendingProposals;

    const pendingCard = document.getElementById("pendingProposalsCard");
    if (pendingCard) {
        if (pendingProposals > 0) {
            pendingCard.classList.add("stat-alert");
        } else {
            pendingCard.classList.remove("stat-alert");
        }
    }

    document.getElementById("statSanctionedProjects").innerText = sanctionedProjects;
    const sanctionsBadge = document.getElementById("sanctionsTotalBadge");
    if (sanctionsBadge) sanctionsBadge.innerText = `${sanctionedProjects} Sanctioned`;
}

// =====================================================
// 7. RENDER MY ASSIGNED TEAMS TABLE
// =====================================================
function renderTeamsTable() {
    const tbody = document.getElementById("teamsTableBody");
    if (!tbody) return;

    let filtered = state.teams.filter(team => {
        // Text Search
        const query = state.teamSearch.toLowerCase().trim();
        const matchesSearch = !query ||
            (team.teamName && team.teamName.toLowerCase().includes(query)) ||
            (team.teamCode && team.teamCode.toLowerCase().includes(query)) ||
            (team.leaderName && team.leaderName.toLowerCase().includes(query)) ||
            (team.leaderEmail && team.leaderEmail.toLowerCase().includes(query));

        if (!matchesSearch) return false;

        // Proposals for this team
        const teamProps = state.proposals.filter(p => p.teamId === team.teamId);
        const hasSanctioned = teamProps.some(p => p.proposalStatus === "SANCTIONED");
        const hasEndorsed = teamProps.some(p => p.proposalStatus === "ACCEPTED");
        const hasPending = teamProps.some(p => p.proposalStatus === "PENDING");

        if (state.teamFilter === "pending") return hasPending;
        if (state.teamFilter === "endorsed") return hasEndorsed;
        if (state.teamFilter === "sanctioned") return hasSanctioned;
        return true;
    });

    // Update Counts
    const allCount = state.teams.length;
    const pendingCount = state.teams.filter(t => state.proposals.some(p => p.teamId === t.teamId && p.proposalStatus === "PENDING")).length;
    const endorsedCount = state.teams.filter(t => state.proposals.some(p => p.teamId === t.teamId && p.proposalStatus === "ACCEPTED")).length;
    const sanctionedCount = state.teams.filter(t => state.proposals.some(p => p.teamId === t.teamId && p.proposalStatus === "SANCTIONED")).length;

    document.getElementById("countTeamsAll").innerText = allCount;
    document.getElementById("countTeamsPending").innerText = pendingCount;
    document.getElementById("countTeamsEndorsed").innerText = endorsedCount;
    document.getElementById("countTeamsSanctioned").innerText = sanctionedCount;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No assigned teams match the current criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(team => {
        const teamProps = state.proposals.filter(p => p.teamId === team.teamId);
        const hasSanctioned = teamProps.some(p => p.proposalStatus === "SANCTIONED");
        const hasEndorsed = teamProps.some(p => p.proposalStatus === "ACCEPTED");
        const pendingCountTeam = teamProps.filter(p => p.proposalStatus === "PENDING").length;

        let statusHtml = "";
        if (hasSanctioned) {
            statusHtml = `<span class="badge-sanctioned">🏆 Officially Sanctioned</span>`;
        } else if (hasEndorsed) {
            statusHtml = `<span class="badge-endorsed">✓ Endorsed by You</span>`;
        } else if (pendingCountTeam > 0) {
            statusHtml = `<span class="badge-pending">⏳ ${pendingCountTeam} Awaiting Decision</span>`;
        } else if (teamProps.length > 0) {
            statusHtml = `<span class="badge-rejected">✕ All Rejected</span>`;
        } else {
            statusHtml = `<span class="badge-not-submitted">📝 No Proposals Yet</span>`;
        }

        return `
            <tr>
                <td>
                    <strong style="font-size: 15px; color: #0f172a;">${escapeHtml(team.teamName)}</strong>
                    <div style="margin-top: 4px;">
                        <span class="code-chip">${escapeHtml(team.teamCode)}</span>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 600; color: #1e293b;">👑 ${escapeHtml(team.leaderName || "Unknown")}</div>
                    <a href="mailto:${escapeHtml(team.leaderEmail || '')}" style="color: #64748b; font-size: 13px; text-decoration: none;">
                        ✉️ ${escapeHtml(team.leaderEmail || "N/A")}
                    </a>
                </td>
                <td>
                    <span class="badge-member">👥 ${team.currentMemberCount} / 4 Members</span>
                </td>
                <td>
                    ${statusHtml}
                </td>
                <td style="text-align: right;">
                    <div class="actions-cell">
                        <button type="button" class="btn-action-view" onclick="inspectTeamProposals(${team.teamId})">
                            📋 View Proposals (${teamProps.length})
                        </button>
                        <button type="button" class="btn-action-roster" onclick="inspectTeamMentees(${team.teamId})">
                            👥 View Mentees
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function setTeamFilter(filter) {
    state.teamFilter = filter;
    ["tabTeamsAll", "tabTeamsPending", "tabTeamsEndorsed", "tabTeamsSanctioned"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove("active");
    });
    if (filter === "all") document.getElementById("tabTeamsAll").classList.add("active");
    if (filter === "pending") document.getElementById("tabTeamsPending").classList.add("active");
    if (filter === "endorsed") document.getElementById("tabTeamsEndorsed").classList.add("active");
    if (filter === "sanctioned") document.getElementById("tabTeamsSanctioned").classList.add("active");

    renderTeamsTable();
}

function handleTeamSearch(val) {
    state.teamSearch = val;
    renderTeamsTable();
}

function inspectTeamProposals(teamId) {
    state.proposalTeamId = String(teamId);
    state.proposalFilter = "all";
    const selectEl = document.getElementById("proposalTeamSelect");
    if (selectEl) selectEl.value = String(teamId);

    setProposalFilter("all");
    const target = document.getElementById("proposalsSection");
    if (target) target.scrollIntoView({ behavior: "smooth" });
}

function inspectTeamMentees(teamId) {
    state.studentTeamId = String(teamId);
    state.studentFilter = "all";
    const selectEl = document.getElementById("studentTeamSelect");
    if (selectEl) selectEl.value = String(teamId);

    setStudentFilter("all");
    const target = document.getElementById("studentsSection");
    if (target) target.scrollIntoView({ behavior: "smooth" });
}

// =====================================================
// 8. RENDER PROPOSALS EVALUATION TABLE
// =====================================================
function renderProposalsTable() {
    const tbody = document.getElementById("proposalsTableBody");
    if (!tbody) return;

    let filtered = state.proposals.filter(p => {
        // Team filter
        if (state.proposalTeamId !== "all" && String(p.teamId) !== String(state.proposalTeamId)) {
            return false;
        }

        // Status filter
        if (state.proposalFilter === "pending" && p.proposalStatus !== "PENDING") return false;
        if (state.proposalFilter === "accepted" && p.proposalStatus !== "ACCEPTED") return false;
        if (state.proposalFilter === "sanctioned" && p.proposalStatus !== "SANCTIONED") return false;
        if (state.proposalFilter === "rejected" && p.proposalStatus !== "REJECTED") return false;

        // Search filter
        const query = state.proposalSearch.toLowerCase().trim();
        if (query) {
            const matches = (p.title && p.title.toLowerCase().includes(query)) ||
                            (p.projectDescription && p.projectDescription.toLowerCase().includes(query)) ||
                            (p.teamName && p.teamName.toLowerCase().includes(query)) ||
                            (p.teamCode && p.teamCode.toLowerCase().includes(query)) ||
                            (p.leaderName && p.leaderName.toLowerCase().includes(query));
            if (!matches) return false;
        }
        return true;
    });

    // Counts for tabs (based on selected team filter or all)
    const baseList = state.proposalTeamId === "all"
        ? state.proposals
        : state.proposals.filter(p => String(p.teamId) === String(state.proposalTeamId));

    document.getElementById("countProposalAll").innerText = baseList.length;
    document.getElementById("countProposalPending").innerText = baseList.filter(p => p.proposalStatus === "PENDING").length;
    document.getElementById("countProposalAccepted").innerText = baseList.filter(p => p.proposalStatus === "ACCEPTED").length;
    document.getElementById("countProposalSanctioned").innerText = baseList.filter(p => p.proposalStatus === "SANCTIONED").length;
    document.getElementById("countProposalRejected").innerText = baseList.filter(p => p.proposalStatus === "REJECTED").length;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No project proposals match the active filters.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        let statusBadge = "";
        let actionsHtml = "";

        if (p.proposalStatus === "SANCTIONED") {
            statusBadge = `<span class="badge-sanctioned">🏆 Officially Sanctioned</span>`;
            actionsHtml = `<span class="badge-sanctioned" title="Coordinator has officially sanctioned this project">✓ Project Sanctioned</span>`;
        } else if (p.proposalStatus === "ACCEPTED") {
            statusBadge = `<span class="badge-endorsed">✓ Endorsed</span>`;
            actionsHtml = `<span class="badge-awaiting" title="Awaiting official departmental sanction from coordinator">⏳ Awaiting Sanction</span>`;
        } else if (p.proposalStatus === "REJECTED") {
            statusBadge = `<span class="badge-rejected">✕ Rejected</span>`;
            actionsHtml = `<span class="badge-rejected">✕ Rejected</span>`;
        } else {
            // PENDING
            statusBadge = `<span class="badge-pending">⏳ Pending Review</span>`;
            actionsHtml = `
                <div class="actions-cell">
                    <button type="button" class="btn-endorse" onclick="openEndorseModal(${p.proposalId})">
                        ✓ Endorse
                    </button>
                    <button type="button" class="btn-reject" onclick="rejectProposalDirect(${p.proposalId})">
                        ✕ Reject
                    </button>
                </div>
            `;
        }

        const dateStr = p.submittedAt ? new Date(p.submittedAt).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        }) : "Recently";

        return `
            <tr>
                <td>
                    <strong style="color: #0f172a; font-size: 15px;">${escapeHtml(p.teamName)}</strong>
                    <div style="margin-top: 3px;">
                        <span class="code-chip">${escapeHtml(p.teamCode)}</span>
                    </div>
                    <div style="font-size: 12.5px; color: #64748b; margin-top: 4px;">
                        Leader: ${escapeHtml(p.leaderName || "Unknown")}
                    </div>
                </td>
                <td style="max-width: 360px;">
                    <span class="project-title-text">${escapeHtml(p.title)}</span>
                    <p class="project-abstract-snippet" title="${escapeHtml(p.projectDescription || '')}">
                        ${escapeHtml(p.projectDescription || "No abstract provided.")}
                    </p>
                    <small style="color: #94a3b8; font-size: 11.5px;">Submitted: ${dateStr}</small>
                </td>
                <td>
                    <div class="pdf-pills-row">
                        <a href="/project/view/${p.proposalId}" target="_blank" class="pdf-pill-btn pdf-pill-view" title="View synopsis PDF">
                            👁️ View PDF
                        </a>
                        <a href="/project/download/${p.proposalId}" class="pdf-pill-btn pdf-pill-download" title="Download synopsis PDF">
                            ⬇️ Download
                        </a>
                    </div>
                </td>
                <td>
                    ${statusBadge}
                </td>
                <td style="text-align: right;">
                    ${actionsHtml}
                </td>
            </tr>
        `;
    }).join("");
}

function setProposalFilter(filter) {
    state.proposalFilter = filter;
    ["tabProposalAll", "tabProposalPending", "tabProposalAccepted", "tabProposalSanctioned", "tabProposalRejected"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove("active");
    });
    if (filter === "all") document.getElementById("tabProposalAll").classList.add("active");
    if (filter === "pending") document.getElementById("tabProposalPending").classList.add("active");
    if (filter === "accepted") document.getElementById("tabProposalAccepted").classList.add("active");
    if (filter === "sanctioned") document.getElementById("tabProposalSanctioned").classList.add("active");
    if (filter === "rejected") document.getElementById("tabProposalRejected").classList.add("active");

    renderProposalsTable();
}

function handleProposalSearch(val) {
    state.proposalSearch = val;
    renderProposalsTable();
}

function handleProposalTeamChange(val) {
    state.proposalTeamId = val;
    renderProposalsTable();
}

// =====================================================
// 9. PROPOSAL ACTIONS: ENDORSE / REJECT
// =====================================================
function openEndorseModal(proposalId) {
    const proposal = state.proposals.find(p => p.proposalId === proposalId);
    if (!proposal) return;

    state.selectedProposalForAction = proposal;
    document.getElementById("modalTeamName").innerText = `${proposal.teamName} (${proposal.teamCode})`;
    document.getElementById("modalProjectTitle").innerText = proposal.title;

    const modal = document.getElementById("decisionModal");
    if (modal) modal.style.display = "flex";
}

function closeDecisionModal() {
    const modal = document.getElementById("decisionModal");
    if (modal) modal.style.display = "none";
    state.selectedProposalForAction = null;
}

async function confirmEndorseProposal() {
    if (!state.selectedProposalForAction) return;

    const proposalId = state.selectedProposalForAction.proposalId;
    const confirmBtn = document.getElementById("modalConfirmBtn");
    confirmBtn.disabled = true;
    confirmBtn.innerText = "Endorsing...";

    try {
        const response = await fetch(`/guide/select-proposal/${proposalId}`, {
            method: "PUT"
        });

        if (!response.ok) {
            throw new Error(await response.text() || "Failed to endorse proposal");
        }

        closeDecisionModal();
        showToast("Proposal successfully endorsed and forwarded to Department Coordinator!", "success");

        // Refresh proposals and stats
        await Promise.all([
            loadAllProposals(),
            loadAssignedTeams()
        ]);

        updateStatsOverview();
        renderTeamsTable();
        renderProposalsTable();
        renderSanctionsTable();

    } catch (error) {
        console.error("Endorsement error:", error);
        showToast(error.message || "Failed to endorse proposal", "error");
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerText = "Confirm & Endorse";
    }
}

async function rejectProposalDirect(proposalId) {
    const proposal = state.proposals.find(p => p.proposalId === proposalId);
    const title = proposal ? `"${proposal.title}"` : "this proposal";

    if (!confirm(`Are you sure you want to reject ${title}?`)) {
        return;
    }

    try {
        const response = await fetch(`/guide/reject-proposal/${proposalId}`, {
            method: "PUT"
        });

        if (!response.ok) {
            throw new Error(await response.text() || "Failed to reject proposal");
        }

        showToast("Proposal has been marked as rejected.", "info");

        await Promise.all([
            loadAllProposals(),
            loadAssignedTeams()
        ]);

        updateStatsOverview();
        renderTeamsTable();
        renderProposalsTable();

    } catch (error) {
        console.error("Rejection error:", error);
        showToast(error.message || "Failed to reject proposal", "error");
    }
}

// =====================================================
// 10. RENDER ADVISED STUDENTS (MENTEES) TABLE
// =====================================================
function renderStudentsTable() {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;

    let filtered = state.students.filter(s => {
        // Team filter
        if (state.studentTeamId !== "all" && String(s.teamId) !== String(state.studentTeamId)) {
            return false;
        }

        // Leader / Member filter
        if (state.studentFilter === "leaders" && !s.isLeader && !s.leader) return false;
        if (state.studentFilter === "members" && (s.isLeader || s.leader)) return false;

        // Search query
        const query = state.studentSearch.toLowerCase().trim();
        if (query) {
            const matches = (s.fullName && s.fullName.toLowerCase().includes(query)) ||
                            (s.email && s.email.toLowerCase().includes(query)) ||
                            (s.teamName && s.teamName.toLowerCase().includes(query)) ||
                            (s.teamCode && s.teamCode.toLowerCase().includes(query));
            if (!matches) return false;
        }
        return true;
    });

    const baseList = state.studentTeamId === "all"
        ? state.students
        : state.students.filter(s => String(s.teamId) === String(state.studentTeamId));

    document.getElementById("countStudentAll").innerText = baseList.length;
    document.getElementById("countStudentLeaders").innerText = baseList.filter(s => s.isLeader || s.leader).length;
    document.getElementById("countStudentMembers").innerText = baseList.filter(s => !s.isLeader && !s.leader).length;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No student mentees match the current search or filters.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(s => {
        const isLeader = s.isLeader || s.leader;
        return `
            <tr>
                <td>
                    <strong style="color: #0f172a; font-size: 15px;">${escapeHtml(s.fullName)}</strong>
                </td>
                <td>
                    <a href="mailto:${escapeHtml(s.email)}" style="color: #2864e8; font-weight: 600; text-decoration: none;">
                        ✉️ ${escapeHtml(s.email)}
                    </a>
                </td>
                <td>
                    <span style="font-weight: 700; color: #475569;">${escapeHtml(s.department || "Engineering")}</span>
                </td>
                <td>
                    <span style="font-weight: 600; color: #1e293b;">${escapeHtml(s.teamName || "Unassigned")}</span>
                    ${s.teamCode ? `<span class="code-chip" style="margin-left: 6px;">${escapeHtml(s.teamCode)}</span>` : ""}
                </td>
                <td style="text-align: right;">
                    ${isLeader
                        ? `<span class="badge-leader">👑 Team Leader</span>`
                        : `<span class="badge-member">👥 Member</span>`
                    }
                </td>
            </tr>
        `;
    }).join("");
}

function setStudentFilter(filter) {
    state.studentFilter = filter;
    ["tabStudentAll", "tabStudentLeaders", "tabStudentMembers"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove("active");
    });
    if (filter === "all") document.getElementById("tabStudentAll").classList.add("active");
    if (filter === "leaders") document.getElementById("tabStudentLeaders").classList.add("active");
    if (filter === "members") document.getElementById("tabStudentMembers").classList.add("active");

    renderStudentsTable();
}

function handleStudentSearch(val) {
    state.studentSearch = val;
    renderStudentsTable();
}

function handleStudentTeamChange(val) {
    state.studentTeamId = val;
    renderStudentsTable();
}

function copyMenteesBroadcastNotice() {
    if (state.students.length === 0) {
        showToast("No mentees currently assigned to copy.", "error");
        return;
    }

    let text = `📢 *PROJSETU CAPSTONE PROJECT ADVISING NOTICE*\n`;
    text += `Faculty Mentor: *Prof. ${state.guide ? state.guide.fullName : "Mentor"}*\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;
    text += `Hello students, please check the status of your project proposal on the ProJSetu portal.\n\n`;
    text += `*Assigned Teams:*\n`;

    state.teams.forEach(t => {
        const endorsedProp = state.proposals.find(p => p.teamId === t.teamId && (p.proposalStatus === "ACCEPTED" || p.proposalStatus === "SANCTIONED"));
        const status = endorsedProp ? `Endorsed: "${endorsedProp.title}"` : "Pending Proposal Review";
        text += `• *${t.teamName}* (${t.teamCode}) - Leader: ${t.leaderName} - [${status}]\n`;
    });

    text += `\nPlease ensure your project synopsis and milestone submissions are up-to-date.\nBest regards.`;

    navigator.clipboard.writeText(text).then(() => {
        showToast("Mentees notice copied to clipboard!", "success");
    }).catch(() => {
        showToast("Could not access clipboard.", "error");
    });
}

// =====================================================
// 11. RENDER SANCTIONS TRACKER TABLE
// =====================================================
function renderSanctionsTable() {
    const tbody = document.getElementById("sanctionsTableBody");
    if (!tbody) return;

    if (state.teams.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No assigned teams found.</td></tr>`;
        return;
    }

    tbody.innerHTML = state.teams.map(team => {
        const sanctionedProp = state.proposals.find(p => p.teamId === team.teamId && p.proposalStatus === "SANCTIONED");
        const acceptedProp = state.proposals.find(p => p.teamId === team.teamId && p.proposalStatus === "ACCEPTED");
        const activeProp = sanctionedProp || acceptedProp;

        let statusCell = "";
        if (sanctionedProp) {
            statusCell = `<span class="badge-sanctioned" style="font-size: 13px;">🏆 Officially Sanctioned by Dept Coordinator</span>`;
        } else if (acceptedProp) {
            statusCell = `<span class="badge-awaiting" style="font-size: 13px;">⏳ Forwarded to Coordinator — Sanction Pending</span>`;
        } else {
            statusCell = `<span class="badge-not-submitted" style="font-size: 13px;">📝 Awaiting Guide Proposal Endorsement</span>`;
        }

        const dateStr = activeProp && activeProp.submittedAt ? new Date(activeProp.submittedAt).toLocaleDateString() : "—";

        return `
            <tr>
                <td>
                    <strong style="font-size: 15px; color: #0f172a;">${escapeHtml(team.teamName)}</strong>
                    <div style="margin-top: 3px;">
                        <span class="code-chip">${escapeHtml(team.teamCode)}</span>
                    </div>
                </td>
                <td>
                    ${activeProp ? `
                        <strong style="color: #1e293b;">${escapeHtml(activeProp.title)}</strong>
                        <p class="project-abstract-snippet" style="max-width: 320px; font-size: 12.5px;">
                            ${escapeHtml(activeProp.projectDescription || '')}
                        </p>
                    ` : `<span style="color: #94a3b8; font-style: italic;">No proposal endorsed yet</span>`}
                </td>
                <td>
                    ${activeProp ? `
                        <a href="/project/view/${activeProp.proposalId}" target="_blank" class="pdf-pill-btn pdf-pill-view">
                            👁️ View PDF
                        </a>
                    ` : `—`}
                </td>
                <td style="color: #64748b; font-size: 13px;">
                    ${dateStr}
                </td>
                <td style="text-align: right;">
                    ${statusCell}
                </td>
            </tr>
        `;
    }).join("");
}

// =====================================================
// 12. TOAST NOTIFICATIONS & UTILITIES
// =====================================================
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success" ? "✅" : (type === "error" ? "🚨" : "ℹ️");
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function setupNavScrollSpy() {
    const navLinks = document.querySelectorAll(".sidebar-nav .nav-item");
    const sections = [
        document.getElementById("dashboardSection") || document.getElementById("top"),
        document.getElementById("teamsSection"),
        document.getElementById("proposalsSection"),
        document.getElementById("studentsSection"),
        document.getElementById("sanctionsSection")
    ].filter(Boolean);

    window.addEventListener("scroll", () => {
        let currentId = "navDashboard";
        const scrollY = window.pageYOffset + 120;

        sections.forEach(sec => {
            if (sec && sec.offsetTop <= scrollY) {
                if (sec.id === "teamsSection") currentId = "navTeams";
                else if (sec.id === "proposalsSection") currentId = "navProposals";
                else if (sec.id === "studentsSection") currentId = "navStudents";
                else if (sec.id === "sanctionsSection") currentId = "navSanctions";
                else currentId = "navDashboard";
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle("active", link.id === currentId);
        });
    });
}

function logout() {
    fetch("/users/logout", { method: "POST" })
        .then(() => {
            window.location.href = "/login.html";
        })
        .catch(err => {
            console.error("Logout error:", err);
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