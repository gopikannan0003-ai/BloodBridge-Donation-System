const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";
    message.style.color = "#555";

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            message.textContent = "Login successful!";
            message.style.color = "green";

            setTimeout(() => {

                if (data.user.role === "donor") {
                    window.location.href = "donor.html";

                } else if (data.user.role === "admin") {
                    window.location.href = "admin.html";

                } else {
                    window.location.href = "find-blood.html";
                }

            }, 1000);

        } else {
            message.textContent =
                data.message || "Invalid email or password.";
            message.style.color = "red";
        }

    } catch (error) {
        console.error(error);

        message.textContent =
            "Server connection failed. Please try again.";

        message.style.color = "red";
    }
});