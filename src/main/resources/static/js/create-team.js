
function createTeam() {

    let teamName =
        document.getElementById("teamName").value;


    // Validate team name
    if (teamName.trim() === "") {

        document.getElementById("message").innerText =
            "Enter team name.";

        return;
    }


    // Send request to backend
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

        document.getElementById("message").innerText = data;


        // Team created successfully
        if (data === "Team Created Successfully.") {

            setTimeout(function () {

                window.location.href = "my-team.html";

            }, 500);

        }

    })

    .catch(error => {

        console.log(error);

        document.getElementById("message").innerText =
            "Something went wrong.";

    });

}
