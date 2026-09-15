/*
 * =========================================
 * ProjStu - My Team
 * =========================================
 */

console.log("MY TEAM JS IS WORKING");


/*
 * =========================================
 * Get Team Details
 * =========================================
 */

fetch("/my_team/details")

    .then(response => {

        console.log(
            "Details response status =",
            response.status
        );

        if (!response.ok) {
            throw new Error("Unable to get team details");
        }

        return response.json();
    })

    .then(team => {

        console.log("Team received =", team);


        /*
         * Display Team Details
         */

        document.getElementById("teamName").innerText =
            team.teamName;

        document.getElementById("teamCode").innerText =
            team.teamCode;

        document.getElementById("leaderName").innerText =
            team.leaderName;


        /*
         * =========================================
         * Check if Logged-in User is Team Leader
         * =========================================
         */

        if (!team.isLeader) {

            // User is a normal team member
            // Hide Pending Join Requests card

            document.getElementById(
                "pendingRequestsCard"
            ).style.display = "none";

        } else {

            // User is the team leader
            // Load pending join requests

            console.log(
                "User is team leader. Loading join requests..."
            );

            loadJoinRequests();
        }


        /*
         * =========================================
         * Get Team Members
         * =========================================
         */

        console.log("Calling get_team_members...");

        return fetch("/my_team/get_team_members");
    })

    .then(response => {

        console.log(
            "Members response status =",
            response.status
        );

        if (!response.ok) {
            throw new Error("Unable to get team members");
        }

        return response.json();
    })

    .then(members => {

        console.log(
            "Members received =",
            members
        );

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
                member.name +
                " - " +
                member.email;

            memberList.appendChild(li);

        });

    })

    .catch(error => {

        console.error(
            "TEAM ERROR =",
            error
        );

        document.getElementById("teamMembers").innerHTML =
            "<li>Unable to load team information.</li>";

    });


/*
 * =========================================
 * Get Pending Join Requests
 * =========================================
 */

function loadJoinRequests() {

    console.log(
        "Calling get_join_request_list..."
    );


    fetch("/my_team/get_join_request_list", {

        method: "POST"

    })

        .then(response => {

            console.log(
                "Join requests response status =",
                response.status
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to get join requests"
                );
            }

            return response.json();
        })

        .then(requests => {

            console.log(
                "Join requests received =",
                requests
            );


            const requestList =
                document.getElementById("joinRequests");

            requestList.innerHTML = "";


            if (requests.length === 0) {

                requestList.innerHTML =
                    "<li>No pending requests.</li>";

                return;
            }


            requests.forEach(request => {

                const li =
                    document.createElement("li");


                /*
                 * Display student name and email
                 */

                li.innerText =
                    request.name +
                    " - " +
                    request.email +
                    " ";


                /*
                 * Accept Button
                 */

                const acceptButton =
                    document.createElement("button");

                acceptButton.innerText =
                    "Accept";

                acceptButton.onclick =
                    function () {

                        respondToJoinRequest(
                            request.requestId,
                            "ACCEPTED"
                        );

                    };


                /*
                 * Reject Button
                 */

                const rejectButton =
                    document.createElement("button");

                rejectButton.innerText =
                    "Reject";

                rejectButton.onclick =
                    function () {

                        respondToJoinRequest(
                            request.requestId,
                            "REJECTED"
                        );

                    };


                /*
                 * Add buttons to request
                 */

                li.appendChild(acceptButton);

                li.appendChild(rejectButton);

                requestList.appendChild(li);

            });

        })

        .catch(error => {

            console.error(
                "JOIN REQUEST ERROR =",
                error
            );

            document.getElementById("joinRequests").innerHTML =
                "<li>Unable to load requests.</li>";

        });

}


/*
 * =========================================
 * Respond to Join Request
 * =========================================
 */

function respondToJoinRequest(
    requestId,
    requestStatus
) {

    console.log(
        "Processing request:",
        requestId,
        requestStatus
    );


    fetch(
        "/my_team/respond_to_join_request",
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                requestId: requestId,

                requestStatus: requestStatus

            })

        }
    )

        .then(response => {

            console.log(
                "Response status =",
                response.status
            );

            if (!response.ok) {

                throw new Error(
                    "Unable to process request"
                );

            }

            return response.text();

        })

        .then(data => {

            console.log(
                "Response =",
                data
            );

            location.reload();

        })

        .catch(error => {

            console.error(
                "REQUEST ERROR =",
                error
            );

        });

}