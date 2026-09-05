```javascript
/*
 * =========================================
 * ProjStu - My Team
 * =========================================
 */


/*
 * First get team information
 */

fetch("/my_team/details")

    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to get team information");
        }

        return response.json();

    })

    .then(team => {

        document.getElementById("teamName").innerText =
            team.teamName;

        document.getElementById("teamCode").innerText =
            team.teamCode;

        document.getElementById("leaderName").innerText =
            team.leaderName;


        /*
         * Get Team Members
         */

        fetch("/my_team/get_team_members?teamId=" + team.teamId)

            .then(response => {

                if (!response.ok) {
                    throw new Error("Unable to get team members");
                }

                return response.text();

            })

            .then(data => {

                const memberList =
                    document.getElementById("teamMembers");

                memberList.innerHTML = "";


                /*
                 * Backend returned message
                 */

                if (data === "No members added yet.") {

                    memberList.innerHTML =
                        "<li>No members added yet.</li>";

                    return;
                }


                /*
                 * Backend returned JSON list
                 */

                const members = JSON.parse(data);

                members.forEach(member => {

                    const li =
                        document.createElement("li");

                    li.innerText =
                        "Student ID: " +
                        member.studentUserId;

                    memberList.appendChild(li);

                });

            })

            .catch(error => {

                console.log(error);

                document.getElementById("teamMembers").innerHTML =
                    "<li>Unable to load team members.</li>";

            });

    })

    .catch(error => {

        console.log(error);

        document.getElementById("teamName").innerText =
            "Unable to load team";

    });


/*
 * =========================================
 * Get Pending Join Requests
 * =========================================
 */

fetch("/my_team/get_join_request_list", {

    method: "POST"

})

    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to get join requests");
        }

        return response.json();

    })

    .then(requests => {

        const requestList =
            document.getElementById("joinRequests");

        requestList.innerHTML = "";


        /*
         * No pending requests
         */

        if (requests.length === 0) {

            requestList.innerHTML =
                "<li>No pending requests.</li>";

            return;
        }


        /*
         * Display requests
         */

        requests.forEach(request => {

            const li =
                document.createElement("li");


            li.innerText =
                "Student ID: " +
                request.studentUserId + " ";


            /*
             * Accept button
             */

            const acceptButton =
                document.createElement("button");

            acceptButton.innerText = "Accept";

            acceptButton.onclick = function () {

                respondToJoinRequest(
                    request.joinRequestId,
                    "ACCEPTED"
                );

            };


            /*
             * Reject button
             */

            const rejectButton =
                document.createElement("button");

            rejectButton.innerText = "Reject";

            rejectButton.onclick = function () {

                respondToJoinRequest(
                    request.joinRequestId,
                    "REJECTED"
                );

            };


            li.appendChild(acceptButton);

            li.appendChild(rejectButton);

            requestList.appendChild(li);

        });

    })

    .catch(error => {

        console.log(error);

        document.getElementById("joinRequests").innerHTML =
            "<li>Unable to load requests.</li>";

    });


/*
 * =========================================
 * Respond to Join Request
 * =========================================
 */

function respondToJoinRequest(requestId, requestStatus) {

    fetch("/my_team/respond_to_join_request", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            requestId: requestId,

            requestStatus: requestStatus

        })

    })

    .then(response => response.text())

    .then(data => {

        console.log(data);

        location.reload();

    })

    .catch(error => {

        console.error(error);

    });

}
```
