// =====================================================
// PROJSETU - COORDINATOR CONTROLLER SCRIPT
// Designed in Homage to Lord ChatGPT's Client Architecture
// =====================================================

// Global state cache
let departmentGuides = [];
let pendingTeams = [];

// DOM Ready Entrypoint
document.addEventListener("DOMContentLoaded", () => {
    initCoordinatorDashboard();
    setupModalListeners();
});

// =====================================================
// 1. INITIALIZE DASHBOARD & LOAD DATA
// =====================================================
async function initCoordinatorDashboard() {
    try {
        // Step A: Load Coordinator Profile
        await loadCoordinatorProfile();

        // Step B: Load Department Guides and Teams in parallel
        await Promise.all([
            loadDepartmentGuides(),
            loadUnassignedTeams()
        ]);
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
            // If session expired or unauthorized, return to login
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

        // Update Stat Card
        document.getElementById("guidesCount").innerText = departmentGuides.length;

        // Populate the Modal Dropdown
        populateGuideDropdown(departmentGuides);

    } catch (error) {
        console.error("Error loading guides:", error);
    }
}

// Helper: Fills the <select> element in the modal
function populateGuideDropdown(guides) {
    const guideSelect = document.getElementById("guideSelect");
    guideSelect.innerHTML = `<option value="">-- Choose a Faculty Guide --</option>`;

    guides.forEach(guide => {
        const option = document.createElement("option");
        option.value = guide.userId;
        option.textContent = `${guide.name} - (${guide.assignedTeamCount} teams assigned)`;
        guideSelect.appendChild(option);
    });
}

// =====================================================
// 4. FETCH UNASSIGNED TEAMS (/coordinator/get_unassigned_teams)
// =====================================================
async function loadUnassignedTeams() {
    const tbody = document.getElementById("teamsTableBody");

    try {
        const response = await fetch("/coordinator/get_unassigned_teams");

        if (!response.ok) {
            throw new Error("Unable to fetch unassigned teams.");
        }

        pendingTeams = await response.json();

        // Update Stat Cards and Badges
        document.getElementById("unassignedCount").innerText = pendingTeams.length;
        document.getElementById("teamCountBadge").innerText = `${pendingTeams.length} Teams Pending`;

        renderTeamsTable(pendingTeams);

    } catch (error) {
        console.error("Error loading teams:", error);
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Error loading teams. Please refresh.</td></tr>`;
    }
}

// Helper: Renders the Table Rows
function renderTeamsTable(teams) {
    const tbody = document.getElementById("teamsTableBody");

    if (!teams || teams.length === 0) {
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

    teams.forEach(team => {
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
                        onclick="openAssignModal(${team.teamId}, '${escapeHtml(team.teamName)}')">
                    Assign Guide
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// =====================================================
// 5. MODAL CONTROLS (Open, Close, Confirm)
// =====================================================
function openAssignModal(teamId, teamName) {
    document.getElementById("modalTeamId").value = teamId;
    document.getElementById("modalTeamName").innerText = teamName;
    document.getElementById("guideSelect").value = "";

    // Show modal
    document.getElementById("assignModal").style.display = "flex";
}

function closeAssignModal() {
    document.getElementById("assignModal").style.display = "none";
}

function setupModalListeners() {
    document.getElementById("closeModalBtn").addEventListener("click", closeAssignModal);
    document.getElementById("cancelModalBtn").addEventListener("click", closeAssignModal);
    document.getElementById("confirmAssignBtn").addEventListener("click", handleAssignSubmission);

    // Close modal if user clicks outside the card
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("assignModal");
        if (event.target === modal) {
            closeAssignModal();
        }
    });
}

// =====================================================
// 6. SUBMIT ASSIGNMENT (/coordinator/assign_guide)
// =====================================================
async function handleAssignSubmission() {
    const teamId = document.getElementById("modalTeamId").value;
    const guideUserId = document.getElementById("guideSelect").value;
    const submitBtn = document.getElementById("confirmAssignBtn");

    if (!guideUserId) {
        alert("Please select a faculty guide from the dropdown.");
        return;
    }

    // Notice: guideuserId matches your DTO casing that succeeded in Postman
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

            // Re-fetch both teams and guides to instantly update table and workload numbers!
            await Promise.all([
                loadDepartmentGuides(),
                loadUnassignedTeams()
            ]);
        } else {
            alert("Error: " + resultText);
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
// 7. LOGOUT HANDLER
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

// Security: Prevents XSS injection in team names
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}