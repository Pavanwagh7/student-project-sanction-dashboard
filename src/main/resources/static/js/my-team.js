console.log("MY TEAM JS IS WORKING");

fetch("/my_team/details")

    .then(response => {

        console.log("Details response status =", response.status);

        if (!response.ok) {
            throw new Error("Unable to get team details");
        }

        return response.json();
    })

    .then(team => {

        console.log("Team received =", team);

        // Display team details
        document.getElementById("teamName").innerText =
            team.teamName;

        document.getElementById("teamCode").innerText =
            team.teamCode;

        document.getElementById("leaderName").innerText =
            team.leaderName;


        // Get team members
        console.log("Calling get_team_members...");

        return fetch("/my_team/get_team_members");
    })

    .then(response => {

        console.log("Members response status =", response.status);

        if (!response.ok) {
            throw new Error("Unable to get team members");
        }

        return response.json();
    })

    .then(members => {

        console.log("Members received =", members);

        const memberList =
            document.getElementById("teamMembers");

        memberList.innerHTML = "";

        if (members.length === 0) {

            memberList.innerHTML =
                "<li>No members added yet.</li>";

            return;
        }

        members.forEach(member => {

            const li =
                document.createElement("li");

            li.innerText =
                member.name + " - " + member.email;

            memberList.appendChild(li);

        });

    })

    .catch(error => {

        console.error("ERROR =", error);

    });