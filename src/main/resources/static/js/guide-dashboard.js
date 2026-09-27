/* =====================================================
   LOAD GUIDE INFORMATION
   ===================================================== */

fetch("/users/me")

    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to get guide information");
        }

        return response.json();

    })

    .then(guide => {

        if (guide == null) {
            throw new Error("No logged-in guide found");
        }

        document.getElementById("guideName").innerText =
            guide.fullName;

        document.getElementById("profileName").innerText =
            guide.fullName;

        document.getElementById("profileInitial").innerText =
            guide.fullName.charAt(0).toUpperCase();

    })

    .catch(error => {

        console.error("Guide information error:", error);

    });


/* =====================================================
   LOAD ASSIGNED TEAMS
   ===================================================== */

fetch("/guide/assigned-teams")

    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to load assigned teams");
        }

        return response.json();

    })

    .then(teams => {

        const container =
            document.getElementById("teamsContainer");

        if (teams.length === 0) {

            container.innerHTML = `
                <div class="loading-card">
                    No teams have been assigned to you yet.
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        teams.forEach(team => {

            const card =
                document.createElement("div");

            card.className = "team-card";

            card.innerHTML = `

                <div class="team-icon">
                    👥
                </div>

                <div class="team-info">

                    <h3>
                        ${team.teamName}
                    </h3>

                    <p>
                        Team Code: ${team.teamCode}
                    </p>

                    <p>
                        Members: ${team.currentMemberCount}
                    </p>

                </div>

                <a
                    href="guide-proposals.html?teamId=${team.teamId}"
                    class="view-btn">

                    View Proposals

                </a>

            `;

            container.appendChild(card);

        });

    })

    .catch(error => {

        console.error("Assigned teams error:", error);

        document.getElementById("teamsContainer").innerHTML = `

            <div class="loading-card">

                Unable to load assigned teams.

            </div>

        `;

    });


/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {

    fetch("/users/logout", {
        method: "POST"
    })

    .then(response => response.text())

    .then(() => {

        window.location.href = "/login.html";

    })

    .catch(error => {

        console.error("Logout error:", error);

    });

}