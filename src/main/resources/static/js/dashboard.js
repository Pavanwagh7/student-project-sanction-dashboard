// =====================================================
// GET LOGGED-IN STUDENT
// =====================================================

fetch("/users/me")

    .then(response => {

        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error("Unable to get student information");
        }

        return response.json();

    })

    .then(student => {

        console.log("Student received:", student);

        if (student == null) {
            throw new Error("No logged-in user found");
        }

        // Dashboard welcome
        document.getElementById("studentName").innerText =
            student.fullName;

        // Student details
        document.getElementById("name").innerText =
            student.fullName;

        document.getElementById("department").innerText =
            student.department;

        document.getElementById("studentId").innerText =
            student.id;

        // Profile
        document.getElementById("profileName").innerText =
            student.fullName;

        document.getElementById("profileInitial").innerText =
            student.fullName.charAt(0).toUpperCase();

    })

    .catch(error => {

        console.error("Dashboard error:", error);

    });


// =====================================================
// CHECK TEAM STATUS
// =====================================================

fetch("/my_team/status")

    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to get team status");
        }

        return response.json();

    })

    .then(data => {

        const teamActions =
            document.getElementById("teamActions");

        const myTeamButton =
            document.getElementById("myTeamButton");

        const myTeamNav =
            document.getElementById("myTeamNav");


        if (data.inTeam) {

            // Student is already in a team

            teamActions.style.display = "none";

            myTeamButton.style.display = "flex";

            myTeamNav.style.display = "flex";

        }

        else {

            // Student is not in a team

            teamActions.style.display = "grid";

            myTeamButton.style.display = "none";

            myTeamNav.style.display = "none";

        }

    })

    .catch(error => {

        console.error("Team status error:", error);

    });


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    fetch("/users/logout", {
        method: "POST"
    })

    .then(response => response.text())

    .then(data => {

        window.location.href = "/login.html";

    })

    .catch(error => {

        console.error("Logout error:", error);

    });

}