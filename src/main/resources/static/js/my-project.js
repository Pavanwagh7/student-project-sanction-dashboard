// =====================================================
// GET LOGGED-IN STUDENT
// =====================================================

fetch("/users/me")

    .then(response => {

        console.log("Student response status:", response.status);

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


        // Profile name

        document.getElementById("profileName").innerText =
            student.fullName;


        // Profile initial

        document.getElementById("profileInitial").innerText =
            student.fullName.charAt(0).toUpperCase();

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

            console.log(
                "Proposal response status:",
                response.status
            );

            if (!response.ok) {
                throw new Error("Unable to get proposals");
            }

            return response.json();

        })

        .then(proposals => {

            console.log(
                "Proposals received:",
                proposals
            );

            displayProposals(proposals);

        })

        .catch(error => {

            console.error(
                "Proposal loading error:",
                error
            );

        });

}



// =====================================================
// DISPLAY PROPOSALS
// =====================================================

function displayProposals(proposals) {

    const proposalsContainer =
        document.getElementById("proposalsContainer");

    const noProposals =
        document.getElementById("noProposals");

    const newProposalBtn =
        document.getElementById("newProposalBtn");


    // Clear previous proposals

    proposalsContainer.innerHTML = "";


    // =================================================
    // NO PROPOSALS
    // =================================================

    if (proposals.length === 0) {

        noProposals.style.display = "block";

    }

    else {

        noProposals.style.display = "none";


        proposals.forEach(
            (proposal, index) => {

                createProposalCard(
                    proposal,
                    index
                );

            }
        );

    }


    // =================================================
    // MAXIMUM 3 PROPOSALS
    // =================================================

    if (proposals.length >= 3) {

        newProposalBtn.style.display = "none";

    }

    else {

        newProposalBtn.style.display = "block";

    }

}



// =====================================================
// CREATE PROPOSAL CARD
// =====================================================

function createProposalCard(proposal, index) {

    const proposalsContainer =
        document.getElementById("proposalsContainer");


    const card =
        document.createElement("div");

    card.classList.add("proposal-card");


    // Format submitted date/time

    let submittedTime =
        "Not available";


    if (proposal.submittedAt) {

        submittedTime =
            new Date(
                proposal.submittedAt
            ).toLocaleString();

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

            ${proposal.title}

        </h2>


        <p class="proposal-description">

            ${proposal.projectDescription}

        </p>


        <div class="pdf-section">

            <span>📄</span>

            <span>
                ${proposal.pdfFileName}
            </span>

        </div>


        <div class="proposal-footer">

            <span class="submitted-time">

                Submitted:
                ${submittedTime}

            </span>


            <span class="status">

                ${proposal.proposalStatus}

            </span>

        </div>

    `;


    proposalsContainer.appendChild(card);


    // =================================================
    // DELETE PROPOSAL BUTTON
    // =================================================

    card
        .querySelector(".proposal-close")
        .addEventListener(
            "click",
            () => {

                const proposalId =
                    card
                        .querySelector(".proposal-close")
                        .dataset
                        .proposalId;


                deleteProposal(proposalId);

            }
        );

}



// =====================================================
// DELETE PROPOSAL
// =====================================================

async function deleteProposal(proposalId) {

    const response =
        await fetch(
            `/project/delete_proposal/${proposalId}`,
            {
                method: "DELETE"
            }
        );


    const message =
        await response.text();


    console.log(
        "Delete response:",
        response.status,
        message
    );


    if (response.ok) {

        alert(message);

        loadProposals();

    }

    else {

        alert(message);

    }

}



// =====================================================
// SHOW NEW PROPOSAL FORM
// =====================================================

document
    .getElementById("newProposalBtn")
    .addEventListener(
        "click",
        () => {

            const formContainer =
                document.getElementById(
                    "proposalFormContainer"
                );

            formContainer.style.display =
                "block";


            document
                .getElementById("newProposalBtn")
                .style.display = "none";


            formContainer.scrollIntoView({
                behavior: "smooth"
            });

        }
    );



// =====================================================
// CLOSE FORM
// =====================================================

function closeProposalForm() {

    document
        .getElementById("proposalFormContainer")
        .style.display = "none";


    document
        .getElementById("formMessage")
        .innerText = "";


    loadProposals();

}



// Close button

document
    .getElementById("closeFormBtn")
    .addEventListener(
        "click",
        closeProposalForm
    );



// =====================================================
// CANCEL FORM
// =====================================================

document
    .getElementById("cancelProposalBtn")
    .addEventListener(
        "click",
        closeProposalForm
    );



// =====================================================
// SUBMIT NEW PROPOSAL
// =====================================================

document
    .getElementById("proposalForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();


            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();


            const file =
                document
                    .getElementById("file")
                    .files[0];


            const formMessage =
                document.getElementById(
                    "formMessage"
                );


            // =================================================
            // BASIC VALIDATION
            // =================================================

            if (!title) {

                formMessage.innerText =
                    "Please enter project title.";

                return;

            }


            if (!description) {

                formMessage.innerText =
                    "Please enter project description.";

                return;

            }


            if (!file) {

                formMessage.innerText =
                    "Please select a PDF file.";

                return;

            }


            // Make sure selected file is PDF

            if (file.type !== "application/pdf") {

                formMessage.innerText =
                    "Only PDF files are allowed.";

                return;

            }


            // =================================================
            // CREATE FORM DATA
            // =================================================

            const formData =
                new FormData();


            formData.append(
                "title",
                title
            );


            formData.append(
                "description",
                description
            );


            formData.append(
                "file",
                file
            );


            formMessage.innerText =
                "Submitting proposal...";


            try {

                const response =
                    await fetch(
                        "/project/submit_proposal",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const message =
                    await response.text();


                console.log(
                    "Submit response:",
                    response.status,
                    message
                );


                if (response.ok) {

                    formMessage.innerText =
                        message;


                    document
                        .getElementById("proposalForm")
                        .reset();


                    /*
                     * Wait a little so the user
                     * can see the success message.
                     */

                    setTimeout(() => {

                        document
                            .getElementById(
                                "proposalFormContainer"
                            )
                            .style.display = "none";


                        formMessage.innerText = "";


                        loadProposals();

                    }, 800);

                }

                else {

                    formMessage.innerText =
                        message;

                }

            }

            catch (error) {

                console.error(
                    "Proposal submission error:",
                    error
                );


                formMessage.innerText =
                    "Something went wrong while submitting the proposal.";

            }

        }
    );



// =====================================================
// LOGOUT
// =====================================================

function logout() {

    fetch("/users/logout", {
        method: "POST"
    })

    .then(response => response.text())

    .then(data => {

        window.location.href =
            "/login.html";

    })

    .catch(error => {

        console.error(
            "Logout error:",
            error
        );

    });

}



// =====================================================
// LOAD PROPOSALS WHEN PAGE OPENS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProposals();

    }
);