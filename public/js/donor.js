document.addEventListener("DOMContentLoaded", async function () {

    const userName = document.getElementById("userName");
    const bloodGroup = document.getElementById("bloodGroup");
    const lastDonation = document.getElementById("lastDonation");
    const logoutBtn = document.getElementById("logoutBtn");


    // =========================
    // GET LOGGED-IN USER
    // =========================

    try {

        const userResponse = await fetch("/api/user", {
            credentials: "include"
        });

        const userData = await userResponse.json();

        if (!userData.success) {
            window.location.href = "login.html";
            return;
        }

        userName.textContent = userData.user.name;

    } catch (error) {

        console.error("User error:", error);

        window.location.href = "login.html";
        return;
    }


    // =========================
    // GET DONOR PROFILE
    // =========================

    try {

        const profileResponse = await fetch(
            "/api/donor/profile",
            {
                credentials: "include"
            }
        );

        const profileData =
            await profileResponse.json();


        if (profileData.success && profileData.profileExists) {

            const profile = profileData.profile;


            // Blood Group
            bloodGroup.textContent =
                profile.blood_group || "Not Added";


            // Last Donation
            if (profile.last_donation_date) {

                const date =
                    new Date(profile.last_donation_date);

                lastDonation.textContent =
                    date.toLocaleDateString("en-IN");

            } else {

                lastDonation.textContent =
                    "Not Added";
            }

        } else {

            bloodGroup.textContent =
                "Not Added";

            lastDonation.textContent =
                "Not Added";
        }


    } catch (error) {

        console.error("Profile error:", error);

        bloodGroup.textContent =
            "Not Available";

        lastDonation.textContent =
            "Not Available";
    }


    // =========================
    // LOGOUT
    // =========================

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
                    }

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }

            }
        );
    }

});


// =========================
// COMPLETE PROFILE
// =========================

function openProfile() {

    window.location.href =
        "donor-profile.html";
}


// =========================
// BLOOD REQUESTS
// =========================

function viewRequests() {

    window.location.href =
        "donor-requests.html";
}


// =========================
// DONATION HISTORY
// =========================

function viewDonations() {

    window.location.href =
        "donation-history.html";
}


// =========================
// AI BLOOD ASSISTANT
// =========================

function openAIAssistant() {

    window.location.href =
        "ai-assistant.html";
}