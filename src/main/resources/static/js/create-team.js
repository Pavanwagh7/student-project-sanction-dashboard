// =====================================================
// PROJSETU - CREATE TEAM CLIENT LOGIC
// =====================================================

function handleCreateTeamSubmit(e) {
    if (e) e.preventDefault();
    createTeam();
}

function createTeam() {
    const teamNameInput = document.getElementById("teamName");
    const createBtn = document.getElementById("createBtn");

    const teamName = teamNameInput.value.trim();

    if (teamName === "") {
        showMessage("Please enter a valid team name.", "error");
        teamNameInput.focus();
        return;
    }

    createBtn.disabled = true;
    createBtn.innerHTML = `<span>Creating Team...</span>`;

    fetch("/my_team/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            teamName: teamName
        })
    })
    .then(response => response.text())
    .then(data => {
        if (data.includes("Successfully") || data.includes("success")) {
            showMessage(data + " Redirecting to your team...", "success");
            setTimeout(() => {
                window.location.href = "my-team.html";
            }, 800);
        } else {
            showMessage(data, "error");
            createBtn.disabled = false;
            createBtn.innerHTML = `<span>Create Team Now</span> <span>→</span>`;
        }
    })
    .catch(error => {
        console.error("Create team error:", error);
        showMessage("Something went wrong while connecting to the server.", "error");
        createBtn.disabled = false;
        createBtn.innerHTML = `<span>Create Team Now</span> <span>→</span>`;
    });
}

function showMessage(msg, type) {
    const messageBox = document.getElementById("messageBox");
    const messageText = document.getElementById("messageText");
    const messageIcon = document.getElementById("messageIcon");

    if (!messageBox || !messageText) return;

    messageText.innerText = msg;
    messageBox.className = `alert-box alert-${type}`;
    if (messageIcon) messageIcon.innerText = type === "success" ? "✅" : "⚠️";
}
