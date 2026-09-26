document.getElementById("loginForm").addEventListener("submit", function (e) {

    e.preventDefault();


    // Get form data
    let data = {

        email: document.getElementById("email").value,

        password: document.getElementById("password").value

    };


    // Send login request to backend
    fetch("/users/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    })


    .then(response => response.text())


    .then(data => {

        console.log("Server response:", data);


        // Login successful
        if (data.includes("Login Successfully")) {
            // Fetch the user's role to send them to their rightful dashboard!
                fetch("/users/me")
                    .then(res => res.json())
                    .then(user => {
                        if (user.role === "COORDINATOR") {
                            window.location.href = "/coordinator.html";
                        } else if (user.role === "GUIDE") {
                            window.location.href = "/guide.html"; // When built
                        } else {
                            window.location.href = "/dashboard.html"; // Students
                        }
                    })
                    .catch(() => {
                        window.location.href = "/dashboard.html";
                    });
        }

        else {

            document.getElementById("message").innerText = data;

        }

    })


    .catch(error => {

        console.error(error);

        document.getElementById("message").innerText =
            "Something went wrong!";

    });

});

