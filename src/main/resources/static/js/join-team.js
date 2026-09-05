function joinTeam() {

    const teamCodeInput = document.getElementById("teamCode");
    const message = document.getElementById("message");

    const teamCode = teamCodeInput.value.trim();

    // Validate team code
    if (teamCode === "") {

        message.innerText = "Enter team code.";
        message.style.color = "#dc2626";

        teamCodeInput.focus();

        return;
    }

    // Send join request
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

        message.innerText = data;
        message.style.color = "#16a34a";

    })

    .catch(error => {

        console.log(error);

        message.innerText = "Something went wrong.";
        message.style.color = "#dc2626";

    });
}

