const searchForm = document.getElementById("searchForm");
const results = document.getElementById("results");
const logoutBtn = document.getElementById("logoutBtn");


// ==========================================
// GET LATEST BLOOD REQUEST
// ==========================================

async function getLatestBloodRequest() {

    try {

        const response = await fetch(
            "/api/request/my",
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!data.success) {
            return null;
        }

        if (!data.requests || data.requests.length === 0) {
            return null;
        }

        // Latest request
        return data.requests[0];

    } catch (error) {

        console.error(
            "Get latest request error:",
            error
        );

        return null;
    }
}


// ==========================================
// SEARCH DONORS
// ==========================================

searchForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const bloodGroup =
            document.getElementById("bloodGroup").value;

        const city =
            document.getElementById("city").value.trim();


        if (!bloodGroup) {

            results.innerHTML = `
                <div class="empty-message">
                    Please select a blood group.
                </div>
            `;

            return;
        }


        results.innerHTML = `
            <div class="empty-message">
                🔎 Searching for donors...
            </div>
        `;


        try {

            let url =
                `/api/donor/search?bloodGroup=${encodeURIComponent(bloodGroup)}`;


            if (city) {

                url +=
                    `&city=${encodeURIComponent(city)}`;

            }


            const response =
                await fetch(url);


            const data =
                await response.json();


            if (!data.success) {

                results.innerHTML = `
                    <div class="empty-message">
                        ${data.message || "Search failed."}
                    </div>
                `;

                return;
            }


            if (data.donors.length === 0) {

                results.innerHTML = `
                    <div class="empty-message">

                        <h3>
                            No donors found 🩸
                        </h3>

                        <p>
                            No available ${bloodGroup}
                            donors were found for this search.
                        </p>

                    </div>
                `;

                return;
            }


            // Get latest blood request
            const latestRequest =
                await getLatestBloodRequest();


            results.innerHTML = "";


            data.donors.forEach(function (donor) {

                const card =
                    document.createElement("div");

                card.className = "donor-card";


                let requestButton = "";


                if (latestRequest) {

                    requestButton = `

                        <button
                            class="request-btn"
                            onclick="sendBloodRequest(
                                ${latestRequest.id},
                                ${donor.id}
                            )">

                            🩸 Send Blood Request

                        </button>

                    `;

                } else {

                    requestButton = `

                        <button
                            class="request-btn"
                            onclick="createRequestFirst()">

                            🩸 Create Blood Request First

                        </button>

                    `;
                }


                card.innerHTML = `

                    <div class="donor-icon">
                        🩸
                    </div>


                    <span class="blood-badge">
                        ${donor.blood_group}
                    </span>


                    <h3>
                        ${donor.name}
                    </h3>


                    <p>
                        📍 ${donor.city}
                    </p>


                    <p>
                        👤 Age: ${donor.age}
                    </p>


                    <p>
                        📞 ${donor.phone}
                    </p>


                    <button
                        class="contact-btn"
                        onclick="contactDonor('${donor.phone}')">

                        Contact Donor

                    </button>


                    ${requestButton}

                `;


                results.appendChild(card);

            });


        } catch (error) {

            console.error(error);

            results.innerHTML = `

                <div class="empty-message">

                    Server connection failed.
                    Please try again.

                </div>

            `;

        }

    }
);



// ==========================================
// SEND BLOOD REQUEST TO DONOR
// ==========================================

async function sendBloodRequest(
    requestId,
    donorId
) {

    const confirmRequest =
        confirm(
            "Send your blood request to this donor?"
        );


    if (!confirmRequest) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/request/send-donor",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        requestId:
                            requestId,

                        donorId:
                            donorId

                    })
                }
            );


        const data =
            await response.json();


        if (data.success) {

            alert(
                "✅ Blood request sent to donor successfully!"
            );

        } else {

            alert(
                data.message ||
                "Unable to send blood request."
            );

        }


    } catch (error) {

        console.error(
            "Send donor request error:",
            error
        );

        alert(
            "Server connection failed."
        );

    }

}



// ==========================================
// CREATE REQUEST FIRST
// ==========================================

function createRequestFirst() {

    alert(
        "Please create a blood request first."
    );

    window.location.href =
        "request-blood.html";

}



// ==========================================
// CONTACT DONOR
// ==========================================

function contactDonor(phone) {

    alert(
        "Donor contact number: " + phone
    );

}



// ==========================================
// LOGOUT
// ==========================================

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

                console.error(error);

            }

        }
    );

}