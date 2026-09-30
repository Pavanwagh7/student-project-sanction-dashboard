/* =====================================================
   PROJSETU - LOGIN CONTROLLER
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const messageEl = document.getElementById("message");
    const submitBtn = document.getElementById("submitBtn");
    const togglePwdBtn = document.getElementById("togglePasswordBtn");

    // Password visibility toggle
    if (togglePwdBtn && passwordInput) {
        togglePwdBtn.addEventListener("click", function () {
            const isPassword = passwordInput.getAttribute("type") === "password";
            passwordInput.setAttribute("type", isPassword ? "text" : "password");
            togglePwdBtn.innerText = isPassword ? "🙈" : "👁️";
        });
    }

    // Form submit listener
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                showMessage("Please fill in both email and password.", "error");
                return;
            }

            // UI loading state
            setLoading(true);
            hideMessage();

            const requestBody = { email, password };

            fetch("/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            })
            .then(async (response) => {
                const text = await response.text();
                return { ok: response.ok, status: response.status, body: text };
            })
            .then(({ ok, status, body }) => {
                if (body && body.includes("Login Successfully")) {
                    showMessage("Login successful! Redirecting to your dashboard...", "success");

                    // Fetch user details for accurate role redirection
                    fetch("/users/me")
                        .then(res => res.json())
                        .then(user => {
                            if (user && user.role === "COORDINATOR") {
                                window.location.href = "/coordinator.html";
                            } else if (user && user.role === "GUIDE") {
                                window.location.href = "/guide-dashboard.html";
                            } else {
                                window.location.href = "/dashboard.html";
                            }
                        })
                        .catch(() => {
                            window.location.href = "/dashboard.html";
                        });
                } else {
                    setLoading(false);
                    const errorMsg = body || "Invalid Email or Password. Please try again.";
                    showMessage(errorMsg, "error");
                }
            })
            .catch(error => {
                console.error("Login Error:", error);
                setLoading(false);
                showMessage("Unable to connect to server. Please ensure the backend is running.", "error");
            });
        });
    }

    function showMessage(text, type) {
        if (!messageEl) return;
        messageEl.style.display = "block";
        messageEl.className = "alert-box " + (type === "success" ? "alert-success" : "alert-error");
        messageEl.innerHTML = (type === "success" ? "✅ " : "⚠️ ") + text;
    }

    function hideMessage() {
        if (!messageEl) return;
        messageEl.style.display = "none";
        messageEl.className = "alert-box";
        messageEl.innerText = "";
    }

    function setLoading(isLoading) {
        if (!submitBtn) return;
        const btnText = submitBtn.querySelector(".btn-text");
        const btnArrow = submitBtn.querySelector(".btn-arrow");
        const btnSpinner = submitBtn.querySelector(".btn-spinner");

        if (isLoading) {
            submitBtn.disabled = true;
            if (btnText) btnText.innerText = "Signing in...";
            if (btnArrow) btnArrow.style.display = "none";
            if (btnSpinner) btnSpinner.style.display = "inline-block";
        } else {
            submitBtn.disabled = false;
            if (btnText) btnText.innerText = "Sign In to Portal";
            if (btnArrow) btnArrow.style.display = "inline";
            if (btnSpinner) btnSpinner.style.display = "none";
        }
    }
});
