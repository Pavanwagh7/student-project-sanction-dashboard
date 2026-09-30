/* =====================================================
   PROJSETU - STUDENT REGISTRATION CONTROLLER
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const departmentSelect = document.getElementById("department");
    const passwordInput = document.getElementById("password");
    const registerBtn = document.getElementById("registerBtn");
    const messageEl = document.getElementById("message");
    const togglePwdBtn = document.getElementById("togglePasswordBtn");

    // Password rule chips
    const ruleLen = document.getElementById("ruleLen");
    const ruleDigit = document.getElementById("ruleDigit");
    const ruleSpecial = document.getElementById("ruleSpecial");

    // Toggle password visibility
    if (togglePwdBtn && passwordInput) {
        togglePwdBtn.addEventListener("click", function () {
            const isPassword = passwordInput.getAttribute("type") === "password";
            passwordInput.setAttribute("type", isPassword ? "text" : "password");
            togglePwdBtn.innerText = isPassword ? "🙈" : "👁️";
        });
    }

    // Dynamic password rules validation on input
    if (passwordInput) {
        passwordInput.addEventListener("input", function () {
            const val = passwordInput.value;
            validatePasswordRules(val);
        });
    }

    function validatePasswordRules(pwd) {
        // Min 6 chars
        const hasLength = pwd.length >= 6 && pwd.length <= 50;
        // At least 1 digit
        const hasDigit = /\d/.test(pwd);
        // At least 1 special char
        const hasSpecial = /[^A-Za-z0-9\s]/.test(pwd);

        updateChip(ruleLen, hasLength, "Min 6 Chars");
        updateChip(ruleDigit, hasDigit, "1+ Digit (0-9)");
        updateChip(ruleSpecial, hasSpecial, "1+ Special Symbol");

        return { hasLength, hasDigit, hasSpecial };
    }

    function updateChip(chip, isValid, label) {
        if (!chip) return;
        if (isValid) {
            chip.classList.add("valid");
            chip.innerText = "✓ " + label;
        } else {
            chip.classList.remove("valid");
            chip.innerText = label;
        }
    }

    // Form submit listener
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const department = departmentSelect.value;
            const password = passwordInput.value;

            // Client-side validations matching backend constraints
            if (!fullName || fullName.length < 2) {
                showMessage("Full name must be at least 2 characters.", "error");
                fullNameInput.focus();
                return;
            }

            if (!email || !email.endsWith("@gmail.com")) {
                showMessage("Please enter a valid Gmail address ending in @gmail.com", "error");
                emailInput.focus();
                return;
            }

            if (!department) {
                showMessage("Please select your engineering branch / department.", "error");
                departmentSelect.focus();
                return;
            }

            const { hasLength, hasDigit, hasSpecial } = validatePasswordRules(password);
            if (!hasLength) {
                showMessage("Password must be between 6 and 50 characters long.", "error");
                passwordInput.focus();
                return;
            }

            if (!hasDigit) {
                showMessage("Password must contain at least one digit (0-9).", "error");
                passwordInput.focus();
                return;
            }

            if (!hasSpecial) {
                showMessage("Password must contain at least one special character (e.g. !@#$%^&*).", "error");
                passwordInput.focus();
                return;
            }

            // Submit to backend
            setLoading(true);
            hideMessage();

            const payload = {
                fullName,
                email,
                department,
                password
            };

            fetch("/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(async (response) => {
                const text = await response.text();
                return { ok: response.ok, status: response.status, body: text };
            })
            .then(({ ok, status, body }) => {
                setLoading(false);

                if (ok || (body && body.includes("opened"))) {
                    // Registration Success
                    showSuccessState(body || "Account created successfully! You can now log in.");
                    registerForm.reset();
                    validatePasswordRules("");
                } else {
                    // Registration Error (e.g. Account already exists)
                    const errorMsg = body || "Registration failed. Please verify your details.";
                    showMessage(errorMsg, "error");
                }
            })
            .catch(error => {
                console.error("Register Error:", error);
                setLoading(false);
                showMessage("Unable to connect to server. Please check your network connection.", "error");
            });
        });
    }

    function showMessage(text, type) {
        if (!messageEl) return;
        messageEl.style.display = "block";
        messageEl.className = "alert-box " + (type === "success" ? "alert-success" : "alert-error");
        messageEl.innerHTML = (type === "success" ? "✅ " : "⚠️ ") + text;
    }

    function showSuccessState(messageText) {
        if (!messageEl) return;
        messageEl.style.display = "block";
        messageEl.className = "alert-box alert-success";
        messageEl.innerHTML = `
            <div>✅ <strong>${messageText}</strong></div>
            <a href="login.html" class="login-action-btn">
                Proceed to Sign In →
            </a>
        `;
    }

    function hideMessage() {
        if (!messageEl) return;
        messageEl.style.display = "none";
        messageEl.className = "alert-box";
        messageEl.innerText = "";
    }

    function setLoading(isLoading) {
        if (!registerBtn) return;
        const btnText = registerBtn.querySelector(".btn-text");
        const btnArrow = registerBtn.querySelector(".btn-arrow");
        const btnSpinner = registerBtn.querySelector(".btn-spinner");

        if (isLoading) {
            registerBtn.disabled = true;
            if (btnText) btnText.innerText = "Creating Account...";
            if (btnArrow) btnArrow.style.display = "none";
            if (btnSpinner) btnSpinner.style.display = "inline-block";
        } else {
            registerBtn.disabled = false;
            if (btnText) btnText.innerText = "Create Student Account";
            if (btnArrow) btnArrow.style.display = "inline";
            if (btnSpinner) btnSpinner.style.display = "none";
        }
    }
});
