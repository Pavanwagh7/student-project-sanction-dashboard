// =====================================================
// PROJSETU COORDINATOR MODULE
// State Management & Reactive Data Stream
// =====================================================

let state = {
    coordinator: null,
    guides: [],
    unassignedTeams: [],
    assignedTeams: [],
    students: [],
    proposals: [],
    activeTableTab: "assigned", // Defaults to assigned since your teams are assigned
    studentFilter: "all",
    studentSearch: "",
    proposalFilter: "all",
    proposalSearch: ""
};

// =====================================================
// 1. INITIALIZATION ON DOM READY
// =====================================================
document.addEventListener("DOMContentLoaded", async () => {
    initModalEvents();

    try {
        await loadCoordinatorProfile();

        await Promise.all([
            loadDepartmentGuides(),
            loadUnassignedTeams(),
            loadAssignedTeams(),
            loadDepartmentStudents(),
            loadDepartmentProposals()
        ]);

        renderCurrentTable();
        renderGuidesDirectory();
        renderStudentsTable();
        renderProposalsTable();

    } catch (err) {
        console.error("Initialization error:", err);
    }
});

// =====================================================
// 2. LOAD COORDINATOR PROFILE
// =====================================================
async function loadCoordinatorProfile() {
    try {
        const response = await fetch("/users/me");
        if (!response.ok) throw new Error("Unauthorized");

        state.coordinator = await response.json();

        document.getElementById("coordinatorName").innerText = state.coordinator.fullName || "Coordinator";
        document.getElementById("profileName").innerText = state.coordinator.fullName || "Coordinator";
        document.getElementById("coordinatorDeptBadge").innerText = state.coordinator.department || "Engineering";
        document.getElementById("profileInitial").innerText = (state.coordinator.fullName || "C").charAt(0).toUpperCase();

    } catch (error) {
        console.error("Failed to load profile:", error);
        window.location.href = "/login.html";
    }
}

// =====================================================
// 3. LOAD DEPARTMENT GUIDES (Endpoint: /coordinator/guides)
// =====================================================
async function loadDepartmentGuides() {
    try {
        const response = await fetch("/coordinator/guides");
        if (!response.ok) throw new Error("Unable to fetch guides");

        state.guides = await response.json();
        document.getElementById("guidesCount").innerText = state.guides.length;
        document.getElementById("guidesDirectoryBadge").innerText = `${state.guides.length} Mentors`;

    } catch (error) {
        console.error("Guides load error:", error);
        state.guides = [];
    }
}

// =====================================================
// 4. LOAD UNASSIGNED TEAMS (Endpoint: /coordinator/get_unassigned_teams)
// =====================================================
async function loadUnassignedTeams() {
    try {
        const response = await fetch("/coordinator/get_unassigned_teams");
        if (!response.ok) throw new Error("Unable to fetch unassigned teams");

        state.unassignedTeams = await response.json();

        const count = state.unassignedTeams.length;
        document.getElementById("unassignedCount").innerText = count;
        document.getElementById("tabUnassignedCount").innerText = count;

    } catch (error) {
        console.error("Unassigned teams error:", error);
        state.unassignedTeams = [];
    }
}

// =====================================================
// 5. LOAD ASSIGNED TEAMS (Endpoint: /coordinator/get_assigned_teams)
// =====================================================
async function loadAssignedTeams() {
    try {
        const response = await fetch("/coordinator/get_assigned_teams");
        if (!response.ok) throw new Error("Unable to fetch assigned teams");

        state.assignedTeams = await response.json();

        const count = state.assignedTeams.length;
        document.getElementById("assignedCount").innerText = count;
        document.getElementById("tabAssignedCount").innerText = count;

    } catch (error) {
        console.error("Assigned teams error:", error);
        state.assignedTeams = [];
    }
}

// =====================================================
// 6. LOAD DEPARTMENT STUDENTS (Endpoint: /coordinator/get_all_students_from_department)
// =====================================================
async function loadDepartmentStudents() {
    try {
        const response = await fetch("/coordinator/get_all_students_from_department");
        if (!response.ok) throw new Error("Unable to fetch students");

        state.students = await response.json();

        const total = state.students.length;
        const noTeam = state.students.filter(s => s.teamId == null).length;
        const leaders = state.students.filter(s => s.isLeader || s.leader).length;
        const members = state.students.filter(s => s.teamId != null && !s.isLeader && !s.leader).length;

        document.getElementById("unassignedStudentsStat").innerText = noTeam;
        document.getElementById("studentsTotalBadge").innerText = `${total} Students`;
        document.getElementById("countStudentAll").innerText = total;
        document.getElementById("countStudentNoTeam").innerText = noTeam;
        document.getElementById("countStudentLeader").innerText = leaders;
        document.getElementById("countStudentMember").innerText = members;

    } catch (error) {
        console.error("Department students error:", error);
        state.students = [];
    }
}

// =====================================================
// 7. LOAD ACCEPTED PROPOSALS (Endpoint: /coordinator/accepted_proposals)
// =====================================================
async function loadDepartmentProposals() {
    try {
        const response = await fetch("/coordinator/accepted_proposals");
        if (!response.ok) throw new Error("Unable to fetch accepted proposals");

        state.proposals = await response.json();

        const total = state.proposals.length;
        const pending = state.proposals.filter(p => p.proposalStatus === "ACCEPTED").length;
        const sanctioned = state.proposals.filter(p => p.proposalStatus === "SANCTIONED").length;

        document.getElementById("acceptedProjectsStat").innerText = total;
        document.getElementById("proposalsTotalBadge").innerText = `${total} Projects`;
        document.getElementById("countProposalAll").innerText = total;
        document.getElementById("countProposalPending").innerText = pending;
        document.getElementById("countProposalSanctioned").innerText = sanctioned;

    } catch (error) {
        console.error("Proposals load error:", error);
        state.proposals = [];
    }
}

// =====================================================
// 8. RENDER PROPOSALS TABLE
// =====================================================
function renderProposalsTable() {
    const tbody = document.getElementById("proposalsTableBody");
    if (!tbody) return;

    let filtered = state.proposals;

    if (state.proposalFilter === "pending") {
        filtered = filtered.filter(p => p.proposalStatus === "ACCEPTED");
    } else if (state.proposalFilter === "sanctioned") {
        filtered = filtered.filter(p => p.proposalStatus === "SANCTIONED");
    }

    if (state.proposalSearch && state.proposalSearch.trim() !== "") {
        const query = state.proposalSearch.toLowerCase();
        filtered = filtered.filter(p =>
            (p.title && p.title.toLowerCase().includes(query)) ||
            (p.teamName && p.teamName.toLowerCase().includes(query)) ||
            (p.leaderName && p.leaderName.toLowerCase().includes(query)) ||
            (p.guideName && p.guideName.toLowerCase().includes(query)) ||
            (p.teamCode && p.teamCode.toLowerCase().includes(query))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No proposals awaiting sanction. (Proposals will appear here once accepted by a faculty guide).</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(proposal => {
        const isSanctioned = (proposal.proposalStatus === "SANCTIONED");

        const statusBadge = isSanctioned
            ? `<span class="badge-sanctioned">🏆 Officially Sanctioned</span>`
            : `<span class="badge-awaiting">⏳ Awaiting Sanction</span>`;

        const actionBtn = isSanctioned
            ? `<span class="badge-sanctioned" style="font-size:13px;">✓ Sealed</span>`
            : `<button type="button" class="sanction-btn" onclick="sanctionProject(${proposal.proposalId}, '${escapeHtml(proposal.title)}')">
                 🏆 Sanction Project
               </button>`;

        return `
            <tr>
                <td>
                    <strong>${escapeHtml(proposal.teamName)}</strong>
                    <br>
                    <span class="code-chip">${escapeHtml(proposal.teamCode || "N/A")}</span>
                    <br>
                    <small style="color:#64748b;">Leader: ${escapeHtml(proposal.leaderName || "N/A")}</small>
                </td>
                <td>
                    <span class="project-title-text">${escapeHtml(proposal.title)}</span>
                    <p class="project-abstract-snippet">${escapeHtml(proposal.projectDescription || "No abstract provided.")}</p>
                </td>
                <td>
                    <strong>${escapeHtml(proposal.guideName)}</strong>
                    <br>
                    <small style="color:#64748b;">${escapeHtml(proposal.guideEmail || "N/A")}</small>
                </td>
                <td>
                    <div class="pdf-pills-row">
                        <a href="/project/view/${proposal.proposalId}" target="_blank" class="pdf-pill-btn pdf-pill-view" title="Open PDF in new tab">
                            👁️ View PDF
                        </a>
                        <a href="/project/download/${proposal.proposalId}" class="pdf-pill-btn pdf-pill-download" title="Download PDF synopsis">
                            ⬇️ Download
                        </a>
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td style="text-align: right;">${actionBtn}</td>
            </tr>
        `;
    }).join("");
}

function setProposalFilter(filterType) {
    state.proposalFilter = filterType;
    document.querySelectorAll("#proposalsSection .tab-pill").forEach(pill => pill.classList.remove("active"));

    if (filterType === "all") document.getElementById("filterProposalAll").classList.add("active");
    if (filterType === "pending") document.getElementById("filterProposalPending").classList.add("active");
    if (filterType === "sanctioned") document.getElementById("filterProposalSanctioned").classList.add("active");

    renderProposalsTable();
}

function handleProposalSearch(value) {
    state.proposalSearch = value;
    renderProposalsTable();
}

// =====================================================
// 9. SANCTION PROJECT ACTION
// =====================================================
async function sanctionProject(proposalId, title) {
    if (!confirm(`Are you sure you want to officially SANCTION this project?\n\nTitle: "${title}"`)) {
        return;
    }

    try {
        const response = await fetch(`/coordinator/sanction_project/${proposalId}`, {
            method: "POST"
        });

        const resultText = await response.text();

        if (response.ok) {
            alert("Success: " + resultText);
            await loadDepartmentProposals();
            renderProposalsTable();
        } else {
            alert("Notice: " + resultText);
        }

    } catch (error) {
        console.error("Sanction error:", error);
        alert("Failed to sanction project. Please try again.");
    }
}

// =====================================================
// 10. RENDER TEAMS ALLOCATION TABLE
// =====================================================
function switchTableTab(tab) {
    state.activeTableTab = tab;
    document.getElementById("tabUnassigned").classList.toggle("active", tab === "unassigned");
    document.getElementById("tabAssigned").classList.toggle("active", tab === "assigned");
    renderCurrentTable();
}

function renderCurrentTable() {
    const thead = document.getElementById("teamsTableHead");
    const tbody = document.getElementById("teamsTableBody");

    if (state.activeTableTab === "unassigned") {
        thead.innerHTML = `
            <tr>
                <th>Team Name</th>
                <th>Team Code</th>
                <th>Team Leader</th>
                <th>Leader Email</th>
                <th style="text-align: right;">Action</th>
            </tr>
        `;

        if (state.unassignedTeams.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-state">🎉 All teams have been successfully assigned a mentor!</td></tr>`;
            return;
        }

        tbody.innerHTML = state.unassignedTeams.map(t => `
            <tr>
                <td><strong>${escapeHtml(t.teamName)}</strong></td>
                <td><span class="code-chip">${escapeHtml(t.teamCode || "N/A")}</span></td>
                <td>${escapeHtml(t.leaderName || "N/A")}</td>
                <td>${escapeHtml(t.leaderEmail || "N/A")}</td>
                <td style="text-align: right;">
                    <button type="button" class="action-btn-assign" onclick="openAssignModal(${t.teamId}, '${escapeHtml(t.teamName)}', false)">
                        Assign Mentor
                    </button>
                </td>
            </tr>
        `).join("");

    } else {
        thead.innerHTML = `
            <tr>
                <th>Team Name</th>
                <th>Team Code</th>
                <th>Assigned Faculty Guide</th>
                <th>Guide Email</th>
                <th style="text-align: right;">Action</th>
            </tr>
        `;

        if (state.assignedTeams.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No teams have been allocated mentors yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = state.assignedTeams.map(t => `
            <tr>
                <td><strong>${escapeHtml(t.teamName)}</strong></td>
                <td><span class="code-chip">${escapeHtml(t.teamCode || "N/A")}</span></td>
                <td><strong>${escapeHtml(t.guideName || "N/A")}</strong></td>
                <td>${escapeHtml(t.guideEmail || "N/A")}</td>
                <td style="text-align: right;">
                    <button type="button" class="action-btn-reassign" onclick="openAssignModal(${t.teamId}, '${escapeHtml(t.teamName)}', true, '${escapeHtml(t.guideName)}')">
                        Reassign
                    </button>
                </td>
            </tr>
        `).join("");
    }
}

// =====================================================
// 11. RENDER STUDENTS ROSTER
// =====================================================
function setStudentFilter(filterType) {
    state.studentFilter = filterType;
    document.querySelectorAll("#studentsSection .tab-pill").forEach(pill => pill.classList.remove("active"));

    if (filterType === "all") document.getElementById("filterStudentAll").classList.add("active");
    if (filterType === "no-team") document.getElementById("filterStudentNoTeam").classList.add("active");
    if (filterType === "leaders") document.getElementById("filterStudentLeader").classList.add("active");
    if (filterType === "members") document.getElementById("filterStudentMember").classList.add("active");

    renderStudentsTable();
}

function handleStudentSearch(val) {
    state.studentSearch = val;
    renderStudentsTable();
}

function renderStudentsTable() {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;

    let filtered = state.students;

    if (state.studentFilter === "no-team") {
        filtered = filtered.filter(s => s.teamId == null);
    } else if (state.studentFilter === "leaders") {
        filtered = filtered.filter(s => s.isLeader || s.leader);
    } else if (state.studentFilter === "members") {
        filtered = filtered.filter(s => s.teamId != null && !s.isLeader && !s.leader);
    }

    if (state.studentSearch && state.studentSearch.trim() !== "") {
        const query = state.studentSearch.toLowerCase();
        filtered = filtered.filter(s =>
            (s.fullName && s.fullName.toLowerCase().includes(query)) ||
            (s.email && s.email.toLowerCase().includes(query)) ||
            (s.teamName && s.teamName.toLowerCase().includes(query)) ||
            (s.teamCode && s.teamCode.toLowerCase().includes(query))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No matching students found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(s => {
        const inTeam = s.teamId != null;
        const isLeader = s.isLeader || s.leader;

        const statusHtml = inTeam
            ? `<span class="status-in-team">✅ Enrolled in Team</span>`
            : `<span class="status-no-team">🚨 Not in a Team</span>`;

        const teamHtml = inTeam
            ? `<strong>${escapeHtml(s.teamName)}</strong> <span class="code-chip">${escapeHtml(s.teamCode)}</span>`
            : `<span style="color:#94a3b8;">—</span>`;

        let roleHtml = `<span class="badge-member">👤 Member</span>`;
        if (isLeader) {
            roleHtml = `<span class="badge-leader">👑 Leader</span>`;
        } else if (!inTeam) {
            roleHtml = `<span style="color:#94a3b8;">—</span>`;
        }

        return `
            <tr>
                <td><strong>${escapeHtml(s.fullName)}</strong></td>
                <td>${escapeHtml(s.email)}</td>
                <td>${statusHtml}</td>
                <td>${teamHtml}</td>
                <td style="text-align: right;">${roleHtml}</td>
            </tr>
        `;
    }).join("");
}

function copyWhatsAppNotice() {
    const unassigned = state.students.filter(s => s.teamId == null);

    if (unassigned.length === 0) {
        alert("Great news! Every student in the department is currently part of a team!");
        return;
    }

    const dept = (state.coordinator && state.coordinator.department) ? state.coordinator.department : "Department";
    const studentList = unassigned.map((s, idx) => `${idx + 1}. ${s.fullName} (${s.email})`).join("\n");

    const message = `🚨 *URGENT NOTICE: FINAL YEAR PROJECT REGISTRATION (${dept})* 🚨\n\n`
        + `The following students have *NOT joined any project team yet*:\n\n`
        + studentList
        + `\n\n⚠️ *Action Required:* Please create or join a team immediately on *ProJSetu* to avoid allocation penalties.\n\n`
        + `- Prof. ${state.coordinator ? state.coordinator.fullName : "Project Coordinator"}\n`
        + `Project Coordinator, ${dept}`;

    navigator.clipboard.writeText(message)
        .then(() => alert(`WhatsApp notice for ${unassigned.length} students copied to clipboard!`))
        .catch(() => alert("Clipboard write failed. Please check browser permissions."));
}

// =====================================================
// 12. RENDER FACULTY MENTORS DIRECTORY
// =====================================================
function renderGuidesDirectory() {
    const grid = document.getElementById("guidesGrid");

    if (state.guides.length === 0) {
        grid.innerHTML = `<p class="empty-state">No faculty mentors registered for this department.</p>`;
        return;
    }

    grid.innerHTML = state.guides.map(g => {
        let workloadClass = "workload-light";
        let workloadText = `${g.assignedTeamCount || 0} Teams Mentored`;

        if ((g.assignedTeamCount || 0) >= 4) {
            workloadClass = "workload-heavy";
        } else if ((g.assignedTeamCount || 0) >= 2) {
            workloadClass = "workload-medium";
        }

        const guideName = g.fullName || g.name || "Faculty Guide";
        const initial = guideName.charAt(0).toUpperCase();

        return `
            <div class="guide-card">
                <div class="guide-card-header">
                    <div class="guide-avatar">${initial}</div>
                    <div>
                        <h4>${escapeHtml(guideName)}</h4>
                        <p>${escapeHtml(g.email)}</p>
                        <span class="workload-pill ${workloadClass}">${workloadText}</span>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// =====================================================
// 13. MODAL & ALLOCATION SUBMISSION (Endpoint: /coordinator/assign_guide)
// =====================================================
function initModalEvents() {
    document.getElementById("closeModalBtn").onclick = closeAssignModal;
    document.getElementById("cancelModalBtn").onclick = closeAssignModal;
    document.getElementById("confirmAssignBtn").onclick = submitGuideAllocation;
}

function openAssignModal(teamId, teamName, isReassignment = false, currentGuideName = "") {
    document.getElementById("modalTeamId").value = teamId;
    document.getElementById("modalTeamName").innerText = teamName;

    const banner = document.getElementById("currentGuideBanner");
    const title = document.getElementById("modalTitle");
    const label = document.getElementById("guideSelectLabel");
    const help = document.getElementById("guideSelectHelp");

    if (isReassignment) {
        title.innerText = "Reassign Faculty Guide";
        label.innerText = "Select New Faculty Guide";
        help.innerText = "Reassigning will transfer mentoring responsibilities to the selected faculty member.";
        document.getElementById("modalCurrentGuideName").innerText = currentGuideName || "Currently Assigned Guide";
        banner.style.display = "flex";
    } else {
        title.innerText = "Assign Faculty Guide";
        label.innerText = "Select Faculty Guide";
        help.innerText = "Number indicates teams currently mentored by each faculty member.";
        banner.style.display = "none";
    }

    const select = document.getElementById("guideSelect");
    select.innerHTML = '<option value="">-- Choose a Faculty Guide --</option>';

    state.guides.forEach(g => {
        const option = document.createElement("option");
        option.value = g.userId;
        const guideName = g.fullName || g.name || "Faculty Guide";
        option.innerText = `${guideName} (${g.assignedTeamCount || 0} teams currently)`;
        select.appendChild(option);
    });

    document.getElementById("assignModal").style.display = "flex";
}

function closeAssignModal() {
    document.getElementById("assignModal").style.display = "none";
}

async function submitGuideAllocation() {
    const teamId = document.getElementById("modalTeamId").value;
    const guideUserId = document.getElementById("guideSelect").value;
    const submitBtn = document.getElementById("confirmAssignBtn");

    if (!guideUserId) {
        alert("Please select a faculty guide from the dropdown.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Allocating...";

    try {
        const response = await fetch("/coordinator/assign_guide", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teamId: parseInt(teamId), guideuserId: parseInt(guideUserId) })
        });

        const resultText = await response.text();

        if (response.ok) {
            closeAssignModal();
            alert("Success: " + resultText);

            await Promise.all([
                loadDepartmentGuides(),
                loadUnassignedTeams(),
                loadAssignedTeams(),
                loadDepartmentStudents(),
                loadDepartmentProposals()
            ]);

            renderCurrentTable();
            renderGuidesDirectory();
            renderStudentsTable();
            renderProposalsTable();
        } else {
            alert("Notice: " + resultText);
        }
    } catch (error) {
        console.error("Assignment error:", error);
        alert("Failed to submit assignment. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Confirm Allocation";
    }
}

// =====================================================
// 14. LOGOUT & XSS HELPERS
// =====================================================
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