const requestForm = document.getElementById("requestForm");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

if (requestForm) {

    requestForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const patientName =
            document.getElementById("patientName").value.trim();

        const bloodGroup =
            document.getElementById("bloodGroup").value;

        const hospitalName =
            document.getElementById("hospitalName").value.trim();

        const city =
            document.getElementById("city").value.trim();

        const unitsRequired =
            document.getElementById("unitsRequired").value;

        const urgency =
            document.getElementById("urgency").value;

        const requiredDate =
            document.getElementById("requiredDate").value;

        // Validate fields
        if (
            !patientName ||
            !bloodGroup ||
            !hospitalName ||
            !city ||
            !unitsRequired ||
            !requiredDate
        ) {
            message.textContent =
                "Please fill all required fields.";

            message.style.color = "red";
            return;
        }

        message.textContent =
            "Submitting blood request...";

        message.style.color = "#555";

        try {

            const response = await fetch(
                "/api/request",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        patientName: patientName,
                        bloodGroup: bloodGroup,
                        hospitalName: hospitalName,
                        city: city,
                        unitsRequired: Number(unitsRequired),
                        urgency: urgency || "Normal",
                        requiredDate: requiredDate
                    })
                }
            );

            // Check HTTP response
            if (!response.ok) {

                let errorMessage =
                    "Blood request submission failed.";

                try {
                    const errorData =
                        await response.json();

                    if (errorData.message) {
                        errorMessage =
                            errorData.message;
                    }

                } catch (e) {
                    console.error(
                        "Error reading server response:",
                        e
                    );
                }

                message.textContent = errorMessage;
                message.style.color = "red";

                return;
            }

            const data = await response.json();

            if (data.success) {

                message.textContent =
                    "Blood request submitted successfully! 🩸";

                message.style.color = "green";

                requestForm.reset();

                setTimeout(function () {

                    window.location.href =
                        "my-requests.html";

                }, 1500);

            } else {

                message.textContent =
                    data.message ||
                    "Request submission failed.";

                message.style.color = "red";
            }

        } catch (error) {

            console.error(
                "Submit Blood Request Error:",
                error
            );

            message.textContent =
                "Unable to connect to server. Make sure BloodBridge server is running.";

            message.style.color = "red";
        }

    });
}


/* ===============================
   LOGOUT
================================ */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            try {

                const response = await fetch(
                    "/api/logout",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

                const data =
                    await response.json();

                if (data.success) {

                    window.location.href =
                        "login.html";

                } else {

                    console.error(
                        "Logout failed:",
                        data.message
                    );

                }

            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );

            }

        }
    );

}

