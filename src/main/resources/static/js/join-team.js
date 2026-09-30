// =====================================================
// PROJSETU - JOIN TEAM CLIENT LOGIC
// =====================================================

function handleJoinTeamSubmit(e) {
    if (e) e.preventDefault();
    joinTeam();
}

function joinTeam() {
    const teamCodeInput = document.getElementById("teamCode");
    const joinBtn = document.getElementById("joinBtn");

    const teamCode = teamCodeInput.value.trim().toUpperCase();

    if (teamCode === "") {
        showMessage("Please enter your team invitation code.", "error");
        teamCodeInput.focus();
        return;
    }

    joinBtn.disabled = true;
    joinBtn.innerHTML = `<span>Sending Request...</span>`;

    fetch("/my_team/join", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            teamCode: teamCode
        })
    })
    .then(response => response.text())
    .then(data => {
        if (data.includes("successfully") || data.includes("Success")) {
            showMessage(data + " Your team leader can now approve your request.", "success");
            teamCodeInput.value = "";
            joinBtn.disabled = false;
            joinBtn.innerHTML = `<span>Submit Join Request</span> <span>→</span>`;
        } else {
            showMessage(data, "error");
            joinBtn.disabled = false;
            joinBtn.innerHTML = `<span>Submit Join Request</span> <span>→</span>`;
        }
    })
    .catch(error => {
        console.error("Join team error:", error);
        showMessage("Something went wrong while connecting to the server.", "error");
        joinBtn.disabled = false;
        joinBtn.innerHTML = `<span>Submit Join Request</span> <span>→</span>`;
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
