
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    // Password check
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        message.style.color = "red";
        return;
    }

    // Phone check
    if (!/^[0-9]{10}$/.test(phone)) {
        message.textContent = "Enter a valid 10-digit phone number!";
        message.style.color = "red";
        return;
    }

    message.textContent = "Creating your account...";
    message.style.color = "#555";

    try {

        const response = await fetch("/api/auth/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                password: password,
                role: role
            })
        });

        const data = await response.json();

        if (data.success) {

            message.textContent =
                "Account created successfully!";

            message.style.color = "green";

            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } else {

            message.textContent =
                data.message || "Registration failed.";

            message.style.color = "red";
        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Server connection failed. Please try again.";

        message.style.color = "red";
    }
});

