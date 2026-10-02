const requestsContainer =
    document.getElementById("requestsContainer");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// LOAD DONOR REQUESTS
// ==========================================

async function loadDonorRequests() {

    requestsContainer.innerHTML = `
        <div class="loading">
            Loading blood requests...
        </div>
    `;

    try {

        const response = await fetch(
            "/api/request/donor",
            {
                method: "GET",
                credentials: "include"
            }
        );


        const data = await response.json();


        // NOT LOGGED IN
        if (!data.success) {

            if (response.status === 401) {

                window.location.href =
                    "login.html";

                return;
            }


            requestsContainer.innerHTML = `
                <div class="empty-message">

                    <h3>
                        Unable to load requests
                    </h3>

                    <p>
                        ${data.message || "Something went wrong."}
                    </p>

                </div>
            `;

            return;
        }


        // NO REQUESTS
        if (
            !data.requests ||
            data.requests.length === 0
        ) {

            requestsContainer.innerHTML = `
                <div class="empty-message">

                    <h3>
                        No blood requests yet 🩸
                    </h3>

                    <p>
                        There are currently no requests
                        matching your donor profile.
                    </p>

                </div>
            `;

            return;
        }


        // CLEAR LOADING
        requestsContainer.innerHTML = "";


        // DISPLAY REQUESTS
        data.requests.forEach(function (request) {

            const card =
                document.createElement("div");


            card.className =
                "request-card";


            // FORMAT DATE
            let requiredDate =
                "Not specified";


            if (request.required_date) {

                const date =
                    new Date(request.required_date);

                requiredDate =
                    date.toLocaleDateString("en-IN");
            }


            // URGENCY CLASS
            const urgencyClass =
                request.urgency
                    .toLowerCase();


            // STATUS CLASS
            const statusClass =
                request.donor_request_status
                    .toLowerCase();


            card.innerHTML = `

                <div class="request-top">

                    <div class="patient-name">

                        👤 ${request.patient_name}

                    </div>


                    <span class="blood-badge">

                        🩸 ${request.blood_group}

                    </span>

                </div>


                <div class="request-details">

                    <div class="detail">

                        🏥
                        <strong>Hospital:</strong>

                        ${request.hospital_name}

                    </div>


                    <div class="detail">

                        📍
                        <strong>City:</strong>

                        ${request.city}

                    </div>


                    <div class="detail">

                        🩸
                        <strong>Units:</strong>

                        ${request.units_required}

                    </div>


                    <div class="detail">

                        📅
                        <strong>Required Date:</strong>

                        ${requiredDate}

                    </div>


                    <div class="detail">

                        ⚠️
                        <strong>Urgency:</strong>

                        <span class="urgency ${urgencyClass}">

                            ${request.urgency}

                        </span>

                    </div>


                    <div class="detail">

                        👤
                        <strong>Requested By:</strong>

                        ${request.seeker_name}

                    </div>

                </div>


                <div class="status-row">

                    <span>
                        Request Status
                    </span>


                    <span class="status ${statusClass}">

                        ${request.donor_request_status}

                    </span>

                </div>


                ${
                    request.donor_request_status === "Pending"
                    ?

                    `
                    <button
                        class="accept-btn"
                        onclick="acceptRequest(${request.donor_request_id})">

                        ✅ Accept Request

                    </button>


                    <button
                        class="reject-btn"
                        onclick="rejectRequest(${request.donor_request_id})">

                        ❌ Reject Request

                    </button>
                    `

                    :

                    ""
                }

            `;


            requestsContainer.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Load donor requests error:",
            error
        );


        requestsContainer.innerHTML = `

            <div class="empty-message">

                <h3>
                    Server connection failed
                </h3>

                <p>
                    Please make sure the
                    BloodBridge server is running.
                </p>

            </div>

        `;
    }
}



// ==========================================
// ACCEPT REQUEST
// ==========================================

async function acceptRequest(donorRequestId) {

    try {

        const response = await fetch(
            "/api/request/donor/accept",
            {
                method: "PUT",

                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    donorRequestId
                })
            }
        );


        const data =
            await response.json();


        alert(
            data.message ||
            "Request updated"
        );


        if (data.success) {

            loadDonorRequests();

        }

    } catch (error) {

        console.error(error);

        alert(
            "Unable to accept request"
        );
    }
}



// ==========================================
// REJECT REQUEST
// ==========================================

async function rejectRequest(donorRequestId) {

    try {

        const response = await fetch(
            "/api/request/donor/reject",
            {
                method: "PUT",

                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    donorRequestId
                })
            }
        );


        const data =
            await response.json();


        alert(
            data.message ||
            "Request updated"
        );


        if (data.success) {

            loadDonorRequests();

        }

    } catch (error) {

        console.error(error);

        alert(
            "Unable to reject request"
        );
    }
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



// ==========================================
// LOAD DATA
// ==========================================

loadDonorRequests();