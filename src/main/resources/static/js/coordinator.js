// =====================================================
// PROJSETU - COORDINATOR CONTROLLER SCRIPT
// =====================================================

// Global state cache
let departmentGuides = [];
let pendingTeams = [];
let assignedTeams = [];
let currentTeamTab = 'pending'; // 'pending' | 'assigned'

// DOM Ready Entrypoint
document.addEventListener("DOMContentLoaded", () => {
    initCoordinatorDashboard();
    setupModalListeners();
    setupTableActionListeners();
    setupSidebarScrollSync();
});

// =====================================================
// 1. INITIALIZE DASHBOARD & LOAD DATA
// =====================================================
async function initCoordinatorDashboard() {
    try {
        // Step A: Load Coordinator Profile
        await loadCoordinatorProfile();

        // Step B: Load Guides, Unassigned Teams, and Assigned Teams in parallel
        await Promise.all([
            loadDepartmentGuides(),
            loadUnassignedTeams(),
            loadAssignedTeams()
        ]);

        // Step C: Render initial tables and Faculty Directory Grid
        renderCurrentTable();
        renderGuidesDirectory();

    } catch (error) {
        console.error("Dashboard initialization failure:", error);
    }
}

// =====================================================
// 2. FETCH COORDINATOR PROFILE (/users/me)
// =====================================================
async function loadCoordinatorProfile() {
    try {
        const response = await fetch("/users/me");

        if (!response.ok) {
            window.location.href = "/login.html";
            return;
        }

        const user = await response.json();

        // Update Header Greetings
        document.getElementById("coordinatorName").innerText = user.fullName;
        document.getElementById("profileName").innerText = user.fullName;
        document.getElementById("profileInitial").innerText = user.fullName.charAt(0).toUpperCase();

        // Update Department Badges
        const dept = user.department || "N/A";
        document.getElementById("coordinatorDeptBadge").innerText = dept + " Coordinator";
        document.getElementById("departmentCode").innerText = dept;

    } catch (error) {
        console.error("Failed to load user profile:", error);
        window.location.href = "/login.html";
    }
}

// =====================================================
// 3. FETCH DEPARTMENT GUIDES (/coordinator/guides)
// =====================================================
async function loadDepartmentGuides() {
    try {
        const response = await fetch("/coordinator/guides");

        if (!response.ok) {
            throw new Error("Unable to fetch department guides.");
        }

        departmentGuides = await response.json();

        // Update Stat Cards and Badges
        document.getElementById("guidesCount").innerText = departmentGuides.length;
        document.getElementById("guidesDirectoryBadge").innerText = `${departmentGuides.length} Faculty Mentors`;

    } catch (error) {
        console.error("Error loading guides:", error);
    }
}

function populateGuideDropdown(guides, currentGuideId = null) {
    const guideSelect = document.getElementById("guideSelect");
    guideSelect.innerHTML = `<option value="">-- Choose a Faculty Guide --</option>`;

    guides.forEach(guide => {
        const option = document.createElement("option");
        option.value = guide.userId;

        const isCurrent = currentGuideId && Number(guide.userId) === Number(currentGuideId);

        if (isCurrent) {
            option.textContent = `${guide.name} (${guide.assignedTeamCount} teams) — [Current Guide]`;
            option.disabled = true; // Prevents re-assigning to the exact same guide!
        } else {
            option.textContent = `${guide.name} (${guide.assignedTeamCount} teams assigned)`;
        }

        guideSelect.appendChild(option);
    });

    // Reset dropdown selection
    guideSelect.value = "";
}

// =====================================================
// 4. FETCH UNASSIGNED TEAMS (/coordinator/get_unassigned_teams)
// =====================================================
async function loadUnassignedTeams() {
    try {
        const response = await fetch("/coordinator/get_unassigned_teams");

        if (!response.ok) {
            throw new Error("Unable to fetch unassigned teams.");
        }

        pendingTeams = await response.json();

        // Update Stat Cards and Tab Badges
        document.getElementById("unassignedCount").innerText = pendingTeams.length;
        document.getElementById("pendingTabCount").innerText = pendingTeams.length;

    } catch (error) {
        console.error("Error loading unassigned teams:", error);
    }
}

// =====================================================
// 5. FETCH ASSIGNED TEAMS (/coordinator/get_assigned_teams)
// =====================================================
async function loadAssignedTeams() {
    try {
        const response = await fetch("/coordinator/get_assigned_teams");

        if (!response.ok) {
            throw new Error("Unable to fetch assigned teams.");
        }

        assignedTeams = await response.json();

        // Update Stat Card and Tab Badges
        document.getElementById("assignedCount").innerText = assignedTeams.length;
        document.getElementById("assignedTabCount").innerText = assignedTeams.length;

    } catch (error) {
        console.error("Error loading assigned teams:", error);
    }
}

// =====================================================
// 6. TAB SWITCHER & TABLE RENDER CONTROLLER
// =====================================================
function switchTeamTab(tab) {
    currentTeamTab = tab;

    const tabPendingBtn = document.getElementById("tabPendingBtn");
    const tabAssignedBtn = document.getElementById("tabAssignedBtn");

    if (tab === 'pending') {
        tabPendingBtn.classList.add("active");
        tabAssignedBtn.classList.remove("active");
        document.getElementById("sectionTitle").innerText = "Teams Pending Guide Allocation";
        document.getElementById("sectionSubtitle").innerText = "Select a team and assign an available department faculty member";
        document.getElementById("teamCountBadge").innerText = `${pendingTeams.length} Teams Pending`;
    } else {
        tabAssignedBtn.classList.add("active");
        tabPendingBtn.classList.remove("active");
        document.getElementById("sectionTitle").innerText = "Allocated Department Teams";
        document.getElementById("sectionSubtitle").innerText = "Overview of teams with their student leaders and faculty mentors";
        document.getElementById("teamCountBadge").innerText = `${assignedTeams.length} Teams Assigned`;
    }

    renderCurrentTable();
}

function renderCurrentTable() {
    if (currentTeamTab === 'pending') {
        renderPendingTeamsTable();
    } else {
        renderAssignedTeamsTable();
    }
}

// Render Tab A: Pending Teams Table
function renderPendingTeamsTable() {
    const thead = document.getElementById("teamsTableHead");
    const tbody = document.getElementById("teamsTableBody");

    thead.innerHTML = `
        <tr>
            <th>Team Name</th>
            <th>Team Code</th>
            <th>Current Members</th>
            <th style="text-align: right;">Action</th>
        </tr>
    `;

    if (!pendingTeams || pendingTeams.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    🎉 All teams in your department have been assigned a faculty guide!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";

    pendingTeams.forEach(team => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="team-name-cell">${escapeHtml(team.teamName)}</td>
            <td><span class="team-code-pill">${escapeHtml(team.teamCode)}</span></td>
            <td>
                <span class="member-count-badge">
                    👥 ${team.currentMemberCount} / 4
                </span>
            </td>
            <td style="text-align: right;">
                <button class="assign-btn"
                        data-action="assign"
                        data-team-id="${team.teamId}"
                        data-team-name="${escapeHtml(team.teamName)}">
                    Assign Guide
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Render Tab B: Assigned Teams Table
function renderAssignedTeamsTable() {
    const thead = document.getElementById("teamsTableHead");
    const tbody = document.getElementById("teamsTableBody");

    thead.innerHTML = `
        <tr>
            <th>Team Name</th>
            <th>Leader & Contact</th>
            <th>Members</th>
            <th>Assigned Faculty Guide</th>
            <th style="text-align: right;">Action</th>
        </tr>
    `;

    if (!assignedTeams || assignedTeams.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No teams have been allocated yet. Switch to "Pending Allocation" to assign guides.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";

    assignedTeams.forEach(team => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <div class="team-name-cell">${escapeHtml(team.teamName)}</div>
                <small class="team-code-pill">${escapeHtml(team.teamCode)}</small>
            </td>
            <td>
                <div class="person-info">
                    <span class="person-name">${escapeHtml(team.leaderName)}</span>
                    <span class="person-email">${escapeHtml(team.leaderEmail)}</span>
                </div>
            </td>
            <td>
                <span class="member-count-badge">
                    👥 ${team.currentMemberCount} / 4
                </span>
            </td>
            <td>
                <div class="guide-badge-box">
                    <span class="guide-icon">👨‍🏫</span>
                    <div class="person-info">
                        <span class="person-name">${escapeHtml(team.guideName)}</span>
                        <span class="person-email">${escapeHtml(team.guideEmail)}</span>
                    </div>
                </div>
            </td>
            <td style="text-align: right;">
                <button class="reassign-btn"
                        data-action="reassign"
                        data-team-id="${team.teamId}"
                        data-team-name="${escapeHtml(team.teamName)}"
                        data-guide-id="${team.guideUserId || ''}"
                        data-guide-name="${escapeHtml(team.guideName || '')}">
                    Reassign
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Robust Event Delegation for Action Buttons (Eliminates all inline onclick eval bugs!)
function setupTableActionListeners() {
    const tbody = document.getElementById("teamsTableBody");

    tbody.addEventListener("click", (event) => {
        const btn = event.target.closest("button[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;
        const teamId = btn.dataset.teamId;
        const teamName = btn.dataset.teamName;

        if (action === "assign") {
            openAssignModal(teamId, teamName);
        } else if (action === "reassign") {
            const guideId = btn.dataset.guideId || null;
            const guideName = btn.dataset.guideName || null;
            openAssignModal(teamId, teamName, guideId, guideName);
        }
    });
}

// =====================================================
// 7. PHASE 2: RENDER FACULTY GUIDES DIRECTORY
// =====================================================
function renderGuidesDirectory() {
    const container = document.getElementById("guidesGrid");

    if (!departmentGuides || departmentGuides.length === 0) {
        container.innerHTML = `<p class="empty-state">No faculty mentors found in this department.</p>`;
        return;
    }

    container.innerHTML = "";

    departmentGuides.forEach(guide => {
        const teamsGuiding = assignedTeams.filter(t => Number(t.guideUserId) === Number(guide.userId));
        const count = teamsGuiding.length;

        // Workload status tag
        let statusClass = "status-available";
        let statusText = "Available";

        if (count >= 4) {
            statusClass = "status-full";
            statusText = "Full Capacity";
        } else if (count >= 2) {
            statusClass = "status-active";
            statusText = "Active Load";
        }

        const initials = guide.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

        const card = document.createElement("div");
        card.className = "guide-card";

        card.innerHTML = `
            <div class="guide-card-top">
                <div class="guide-card-avatar">${escapeHtml(initials)}</div>
                <div class="guide-card-title">
                    <h3>${escapeHtml(guide.name)}</h3>
                    <span class="guide-card-dept">${escapeHtml(guide.department)} Faculty</span>
                </div>
            </div>

            <div class="guide-card-meta">
                <span>✉️</span>
                <span>${escapeHtml(guide.email)}</span>
            </div>

            <div class="guide-load-bar-wrap">
                <div class="guide-load-label">
                    <span>Advising Load</span>
                    <span class="load-pill-status ${statusClass}">${count} Teams • ${statusText}</span>
                </div>
            </div>

            <div class="guide-mentored-teams">
                <span class="mentored-label">Mentored Teams:</span>
                <div class="mentored-pills-wrap">
                    ${
                        teamsGuiding.length > 0
                            ? teamsGuiding.map(t => `
                                <span class="mentored-team-chip" title="Team Code: ${escapeHtml(t.teamCode)}">
                                    👥 ${escapeHtml(t.teamName)}
                                </span>
                            `).join("")
                            : `<span class="no-teams-note">No teams assigned yet</span>`
                    }
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// =====================================================
// 8. MODAL CONTROLS (Open, Close, Confirm)
// =====================================================
function openAssignModal(teamId, teamName, currentGuideId = null, currentGuideName = null) {
    document.getElementById("modalTeamId").value = teamId;
    document.getElementById("modalTeamName").innerText = teamName;

    const modalTitle = document.getElementById("modalTitle");
    const currentGuideBanner = document.getElementById("currentGuideBanner");
    const modalCurrentGuideName = document.getElementById("modalCurrentGuideName");
    const guideSelectLabel = document.getElementById("guideSelectLabel");
    const guideSelectHelp = document.getElementById("guideSelectHelp");

    // Populate the dropdown with current guide disabled & marked
    populateGuideDropdown(departmentGuides, currentGuideId);

    if (currentGuideId) {
        modalTitle.innerText = "Reassign Faculty Guide";
        currentGuideBanner.style.display = "flex";
        modalCurrentGuideName.innerText = currentGuideName ? currentGuideName : "Assigned Guide";
        guideSelectLabel.innerText = "Select New Faculty Guide";
        guideSelectHelp.innerText = "Choose a new faculty mentor from your department. The current guide is disabled.";
    } else {
        modalTitle.innerText = "Assign Faculty Guide";
        currentGuideBanner.style.display = "none";
        guideSelectLabel.innerText = "Select Faculty Guide";
        guideSelectHelp.innerText = "Number indicates teams currently mentored by each faculty member.";
    }

    // Display modal cleanly on screen
    document.getElementById("assignModal").style.display = "flex";
}

function closeAssignModal() {
    document.getElementById("assignModal").style.display = "none";
}

function setupModalListeners() {
    document.getElementById("closeModalBtn").addEventListener("click", closeAssignModal);
    document.getElementById("cancelModalBtn").addEventListener("click", closeAssignModal);
    document.getElementById("confirmAssignBtn").addEventListener("click", handleAssignSubmission);

    window.addEventListener("click", (event) => {
        const modal = document.getElementById("assignModal");
        if (event.target === modal) {
            closeAssignModal();
        }
    });
}

// Smooth scroll & Sidebar active highlights
function setupSidebarScrollSync() {
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });
}

// =====================================================
// 9. SUBMIT ASSIGNMENT / REASSIGNMENT (/coordinator/assign_guide)
// =====================================================
async function handleAssignSubmission() {
    const teamId = document.getElementById("modalTeamId").value;
    const guideUserId = document.getElementById("guideSelect").value;
    const submitBtn = document.getElementById("confirmAssignBtn");

    if (!guideUserId) {
        alert("Please select a faculty guide from the dropdown.");
        return;
    }

    const payload = {
        teamId: Number(teamId),
        guideuserId: Number(guideUserId)
    };

    submitBtn.disabled = true;
    submitBtn.innerText = "Allocating...";

    try {
        const response = await fetch("/coordinator/assign_guide", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const resultText = await response.text();

        if (response.ok) {
            closeAssignModal();
            alert("Success: " + resultText);

            // Re-fetch all data simultaneously
            await Promise.all([
                loadDepartmentGuides(),
                loadUnassignedTeams(),
                loadAssignedTeams()
            ]);

            // Re-render both active table and directory cards
            renderCurrentTable();
            renderGuidesDirectory();

        } else {
            alert("Notice: " + resultText);
        }

    } catch (error) {
        console.error("Assignment submission error:", error);
        alert("Failed to submit assignment. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Confirm Allocation";
    }
}

// =====================================================
// 10. LOGOUT HANDLER
// =====================================================
function logout() {
    fetch("/users/logout", {
        method: "POST"
    })
    .then(() => {
        window.location.href = "/login.html";
    })
    .catch(error => {
        console.error("Logout error:", error);
        window.location.href = "/login.html";
    });
}

// Security: Prevents XSS injection
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