document.addEventListener("DOMContentLoaded", async function () {

    // =========================
    // CHECK LOGIN
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

    } catch (error) {

        console.error("User check error:", error);

        window.location.href = "login.html";
        return;
    }


    // =========================
    // LOAD HISTORY
    // =========================

    loadDonationHistory();


    // =========================
    // LOGOUT
    // =========================

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async function () {

                try {

                    const response =
                        await fetch(
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


    // =========================
    // ADD DONATION FORM
    // =========================

    const donationForm =
        document.getElementById("donationForm");

    if (donationForm) {

        donationForm.addEventListener(
            "submit",
            addDonation
        );

    }

});


// ==================================================
// LOAD DONATION HISTORY
// ==================================================

async function loadDonationHistory() {

    const container =
        document.getElementById("historyContainer");

    const totalDonations =
        document.getElementById("totalDonations");

    const totalUnits =
        document.getElementById("totalUnits");


    if (!container) {
        return;
    }


    container.innerHTML =
        '<div class="loading">Loading donation history...</div>';


    try {

        const response =
            await fetch(
                "/api/donation/history",
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        // =========================
        // SESSION EXPIRED
        // =========================

        if (response.status === 401) {

            window.location.href =
                "login.html";

            return;
        }


        // =========================
        // OTHER ERROR
        // =========================

        if (!data.success) {

            container.innerHTML = `
                <div class="empty">
                    <h3>${escapeHTML(
                        data.message ||
                        "Unable to load donation history"
                    )}</h3>
                </div>
            `;

            return;
        }


        // =========================
        // PROFILE NOT FOUND
        // =========================

        if (!data.profileExists) {

            totalDonations.textContent = "0";
            totalUnits.textContent = "0";

            container.innerHTML = `
                <div class="empty">
                    <h3>Donor profile not found</h3>
                    <p>Please complete your donor profile first.</p>
                </div>
            `;

            return;
        }


        const donations =
            data.donations || [];


        // =========================
        // TOTAL DONATIONS
        // =========================

        totalDonations.textContent =
            donations.length;


        // =========================
        // TOTAL UNITS
        // =========================

        let total = 0;

        donations.forEach(function (donation) {

            total +=
                Number(donation.units_donated) || 0;

        });

        totalUnits.textContent = total;


        // =========================
        // EMPTY HISTORY
        // =========================

        if (donations.length === 0) {

            container.innerHTML = `
                <div class="empty">
                    <h3>No donation records yet 🩸</h3>
                    <p>
                        Add your first donation record using
                        the Add Donation button.
                    </p>
                </div>
            `;

            return;
        }


        // =========================
        // DISPLAY RECORDS
        // =========================

        container.innerHTML = "";


        donations.forEach(function (donation) {

            const card =
                document.createElement("div");

            card.className =
                "donation-card";


            const bloodGroup =
                escapeHTML(
                    donation.blood_group ||
                    "Unknown"
                );

            const status =
                escapeHTML(
                    donation.status ||
                    "Completed"
                );

            const hospital =
                escapeHTML(
                    donation.hospital_name ||
                    "Not specified"
                );

            const city =
                escapeHTML(
                    donation.city ||
                    "Not specified"
                );

            const units =
                Number(
                    donation.units_donated
                ) || 1;

            const date =
                formatDate(
                    donation.donation_date
                );


            card.innerHTML = `

                <div class="donation-top">

                    <div class="blood-group">
                        🩸 ${bloodGroup}
                    </div>

                    <div class="status">
                        ${status}
                    </div>

                </div>


                <div class="donation-details">

                    <div class="detail">
                        📅
                        <strong>Date:</strong>
                        ${date}
                    </div>


                    <div class="detail">
                        🏥
                        <strong>Hospital:</strong>
                        ${hospital}
                    </div>


                    <div class="detail">
                        📍
                        <strong>City:</strong>
                        ${city}
                    </div>


                    <div class="detail">
                        🩸
                        <strong>Units:</strong>
                        ${units}
                    </div>

                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Donation history error:",
            error
        );


        container.innerHTML = `
            <div class="empty">
                <h3>Unable to load donation history</h3>
                <p>
                    Please make sure the BloodBridge
                    server is running.
                </p>
            </div>
        `;
    }
}


// ==================================================
// SHOW ADD DONATION FORM
// ==================================================

function showAddDonationForm() {

    const section =
        document.getElementById(
            "addDonationSection"
        );

    if (section) {

        section.style.display = "block";

        section.scrollIntoView({
            behavior: "smooth"
        });

    }
}


// ==================================================
// HIDE ADD DONATION FORM
// ==================================================

function hideAddDonationForm() {

    const section =
        document.getElementById(
            "addDonationSection"
        );

    if (section) {

        section.style.display = "none";

    }
}


// ==================================================
// ADD DONATION
// ==================================================

async function addDonation(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "donationMessage"
        );


    const bloodGroup =
        document.getElementById(
            "blood_group"
        ).value;

    const donationDate =
        document.getElementById(
            "donation_date"
        ).value;

    const hospitalName =
        document.getElementById(
            "hospital_name"
        ).value.trim();

    const city =
        document.getElementById(
            "city"
        ).value.trim();

    const units =
        document.getElementById(
            "units_donated"
        ).value;


    message.textContent =
        "Saving donation...";

    message.style.color =
        "#555";


    try {

        const response =
            await fetch(
                "/api/donation/add",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        blood_group:
                            bloodGroup,

                        donation_date:
                            donationDate,

                        hospital_name:
                            hospitalName,

                        city:
                            city,

                        units_donated:
                            Number(units)

                    })
                }
            );


        const data =
            await response.json();


        // =========================
        // LOGIN EXPIRED
        // =========================

        if (response.status === 401) {

            window.location.href =
                "login.html";

            return;
        }


        // =========================
        // ERROR
        // =========================

        if (!data.success) {

            message.textContent =
                data.message ||
                "Unable to save donation.";

            message.style.color =
                "red";

            return;
        }


        // =========================
        // SUCCESS
        // =========================

        message.textContent =
            "Donation record saved successfully! 🩸";

        message.style.color =
            "green";


        // Clear form

        document
            .getElementById("donationForm")
            .reset();


        // Default units = 1

        document
            .getElementById("units_donated")
            .value = 1;


        // Reload history

        await loadDonationHistory();


        // Hide form after short delay

        setTimeout(function () {

            hideAddDonationForm();

            message.textContent = "";

        }, 1200);


    } catch (error) {

        console.error(
            "Add donation error:",
            error
        );


        message.textContent =
            "Server connection failed.";

        message.style.color =
            "red";
    }
}


// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Not available";
    }

    const value = String(dateValue);


    // ==========================================
    // MYSQL DATE
    // YYYY-MM-DD
    // ==========================================

    const dateOnlyMatch =
        value.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (dateOnlyMatch) {

        const year =
            dateOnlyMatch[1];

        const month =
            dateOnlyMatch[2];

        const day =
            dateOnlyMatch[3];

        return `${day} ${getMonthName(month)} ${year}`;
    }


    // ==========================================
    // ISO DATE
    // 2026-10-01T18:30:00.000Z
    // ==========================================

    const isoMatch =
        value.match(
            /^(\d{4})-(\d{2})-(\d{2})T/
        );


    if (isoMatch) {

        const year =
            isoMatch[1];

        const month =
            isoMatch[2];

        const day =
            isoMatch[3];

        return `${day} ${getMonthName(month)} ${year}`;
    }


    // ==========================================
    // FALLBACK DATE
    // ==========================================

    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

        return value;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==================================================
// MONTH NAME
// ==================================================

function getMonthName(month) {

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    const index =
        Number(month) - 1;


    return months[index] || month;
}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==================================================
// MAKE FUNCTIONS AVAILABLE
// ==================================================

window.loadDonationHistory =
    loadDonationHistory;

window.showAddDonationForm =
    showAddDonationForm;

window.hideAddDonationForm =
    hideAddDonationForm;