/*
 * =========================================
 * ProjStu - Register
 * =========================================
 */

document
    .getElementById("registerForm")
    .addEventListener("submit", function (e) {

        e.preventDefault();


        /*
         * Get form data
         */

        const data = {

            email:
                document.getElementById("email").value,

            fullName:
                document.getElementById("fullName").value,

            department:
                document.getElementById("department").value,

            password:
                document.getElementById("password").value

        };


        /*
         * Send registration request
         */

        fetch("/users/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        })

        .then(response => response.text())

        .then(data => {

            const messageElement =
                document.getElementById("message");


            /*
             * Display backend message
             */

            messageElement.innerText = data;


            /*
             * If registration is successful,
             * show Go to Login button
             */

            if (data.includes("opened")) {

                const btn =
                    document.createElement("button");

                btn.innerText = "Go to Login";

                btn.className =
                    "login-redirect-btn";


                /*
                 * Redirect to Login page
                 */

                btn.onclick = function () {

                    window.location.href =
                        "login.html";

                };


                /*
                 * Replace message
                 * and add Login button
                 */

                messageElement.innerHTML = data;

                messageElement.appendChild(
                    document.createElement("br")
                );

                messageElement.appendChild(btn);

            }

        })

        .catch(error => {

            console.log(error);

            document.getElementById("message").innerText =
                "Something went wrong!";

        });

    });

