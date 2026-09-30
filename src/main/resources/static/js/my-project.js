// =====================================================
// GET LOGGED-IN STUDENT
// =====================================================
fetch("/users/me")
    .then(response => {
        if (!response.ok) {
            throw new Error("Unable to get student information");
        }
        return response.json();
    })
    .then(student => {
        if (student == null) {
            throw new Error("No logged-in user found");
        }
        document.getElementById("profileName").innerText = student.fullName;
        document.getElementById("profileInitial").innerText = student.fullName.charAt(0).toUpperCase();
    })
    .catch(error => {
        console.error("Student information error:", error);
    });

// =====================================================
// GET MY TEAM'S PROPOSALS
// =====================================================
function loadProposals() {
    fetch("/project/my_proposals")
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to get proposals");
            }
            return response.json();
        })
        .then(proposals => {
            displayProposals(proposals);
        })
        .catch(error => {
            console.error("Proposal loading error:", error);
        });
}

// =====================================================
// DISPLAY PROPOSALS
// =====================================================
function displayProposals(proposals) {
    const proposalsContainer = document.getElementById("proposalsContainer");
    const noProposals = document.getElementById("noProposals");
    const newProposalBtn = document.getElementById("newProposalBtn");

    proposalsContainer.innerHTML = "";

    if (proposals.length === 0) {
        noProposals.style.display = "block";
    } else {
        noProposals.style.display = "none";
        proposals.forEach((proposal, index) => {
            createProposalCard(proposal, index);
        });
    }

    if (proposals.length >= 3) {
        newProposalBtn.style.display = "none";
    } else {
        newProposalBtn.style.display = "block";
    }
}

// =====================================================
// CREATE PROPOSAL CARD (WITH VIEW / DOWNLOAD BUTTONS)
// =====================================================
function createProposalCard(proposal, index) {
    const proposalsContainer = document.getElementById("proposalsContainer");
    const card = document.createElement("div");
    card.classList.add("proposal-card");

    let submittedTime = "Not available";
    if (proposal.submittedAt) {
        submittedTime = new Date(proposal.submittedAt).toLocaleString();
    }

    card.innerHTML = `
        <div class="proposal-header">
            <span class="proposal-number">
                Proposal ${String(index + 1).padStart(2, "0")}
            </span>
            <button
                class="proposal-close"
                type="button"
                data-proposal-id="${proposal.proposalId}">
                ×
            </button>
        </div>

        <h2 class="proposal-title">
            ${escapeHtml(proposal.title)}
        </h2>

        <p class="proposal-description">
            ${escapeHtml(proposal.projectDescription)}
        </p>

        <!-- Upgraded PDF Section with Inline View and Download -->
        <div class="pdf-section">
            <div class="pdf-info">
                <span class="pdf-icon">📄</span>
                <span class="pdf-name" title="${escapeHtml(proposal.pdfFileName)}">
                    ${escapeHtml(proposal.pdfFileName)}
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

        <div class="proposal-footer">
            <span class="submitted-time">
                Submitted: ${submittedTime}
            </span>
            <span class="status">
                ${proposal.proposalStatus}
            </span>
        </div>
    `;

    proposalsContainer.appendChild(card);

    card.querySelector(".proposal-close").addEventListener("click", () => {
        const proposalId = card.querySelector(".proposal-close").dataset.proposalId;
        deleteProposal(proposalId);
    });
}

// =====================================================
// DELETE PROPOSAL
// =====================================================
async function deleteProposal(proposalId) {
    if (!confirm("Are you sure you want to delete this proposal?")) {
        return;
    }
    const response = await fetch(`/project/delete_proposal/${proposalId}`, {
        method: "DELETE"
    });

    const message = await response.text();
    alert(message);
    loadProposals();
}

// =====================================================
// SHOW NEW PROPOSAL FORM
// =====================================================
document.getElementById("newProposalBtn").addEventListener("click", () => {
    const formContainer = document.getElementById("proposalFormContainer");
    formContainer.style.display = "block";
    document.getElementById("newProposalBtn").style.display = "none";
    formContainer.scrollIntoView({ behavior: "smooth" });
});

// =====================================================
// CLOSE FORM
// =====================================================
function closeProposalForm() {
    document.getElementById("proposalFormContainer").style.display = "none";
    document.getElementById("formMessage").innerText = "";
    loadProposals();
}

document.getElementById("closeFormBtn").addEventListener("click", closeProposalForm);
document.getElementById("cancelProposalBtn").addEventListener("click", closeProposalForm);

// =====================================================
// SUBMIT NEW PROPOSAL
// =====================================================
document.getElementById("proposalForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const file = document.getElementById("file").files[0];
    const formMessage = document.getElementById("formMessage");

    if (!title) {
        formMessage.innerText = "Please enter project title.";
        return;
    }

    if (!description) {
        formMessage.innerText = "Please enter project description.";
        return;
    }

    if (!file) {
        formMessage.innerText = "Please select a PDF file.";
        return;
    }

    if (file.type !== "application/pdf") {
        formMessage.innerText = "Only PDF files are allowed.";
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    formMessage.innerText = "Submitting proposal...";

    try {
        const response = await fetch("/project/submit_proposal", {
            method: "POST",
            body: formData
        });

        const message = await response.text();

        if (response.ok) {
            formMessage.innerText = message;
            document.getElementById("proposalForm").reset();

            setTimeout(() => {
                document.getElementById("proposalFormContainer").style.display = "none";
                formMessage.innerText = "";
                loadProposals();
            }, 800);
        } else {
            formMessage.innerText = message;
        }
    } catch (error) {
        console.error("Proposal submission error:", error);
        formMessage.innerText = "Something went wrong while submitting the proposal.";
    }
});

// =====================================================
// LOGOUT & HELPERS
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

function loadAssignedGuideInfo() {
    fetch("/my_team/details")
        .then(res => res.ok ? res.json() : null)
        .then(team => {
            if (!team) return;
            const banner = document.getElementById("projectGuideBanner");
            const icon = document.getElementById("projectGuideIcon");
            const badge = document.getElementById("projectGuideBadge");
            const name = document.getElementById("projectGuideName");
            const emailBox = document.getElementById("projectGuideEmailBox");
            const email = document.getElementById("projectGuideEmail");
            const emailLink = document.getElementById("projectGuideEmailLink");
            const notice = document.getElementById("projectGuideNotice");

            if (banner) banner.style.display = "flex";

            if (team.guideAssigned && team.guideName) {
                if (icon) {
                    icon.style.background = "#ecfdf5";
                    icon.style.color = "#059669";
                }
                if (badge) {
                    badge.style.background = "#dcfce7";
                    badge.style.color = "#15803d";
                    badge.innerText = "✅ Allocated by Coordinator";
                }
                if (name) name.innerText = "Prof. " + team.guideName;
                if (emailBox) emailBox.style.display = "block";
                if (email) email.innerText = team.guideEmail || "N/A";
                if (emailLink) emailLink.href = "mailto:" + (team.guideEmail || "");
                if (notice) notice.innerText = (team.guideDepartment ? `Department: ${team.guideDepartment} • ` : "") + "Will evaluate and endorse your proposals.";
            } else {
                if (icon) {
                    icon.style.background = "#fffbeb";
                    icon.style.color = "#b45309";
                }
                if (badge) {
                    badge.style.background = "#fef3c7";
                    badge.style.color = "#b45309";
                    badge.innerText = "⏳ Allocation Pending";
                }
                if (name) name.innerText = "Not Allocated Yet";
                if (emailBox) emailBox.style.display = "none";
                if (notice) notice.innerText = "Your department coordinator will allocate a faculty mentor soon.";
            }
        })
        .catch(err => console.error("Guide banner error:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    loadProposals();
    loadAssignedGuideInfo();
});