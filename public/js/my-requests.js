const requestsContainer =
    document.getElementById("requestsContainer");

const logoutBtn =
    document.getElementById("logoutBtn");


// LOAD MY REQUESTS
async function loadMyRequests() {

    requestsContainer.innerHTML = `
        <div class="loading">
            Loading your blood requests...
        </div>
    `;

    try {

        const response = await fetch("/api/request/my", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        // NOT LOGGED IN
        if (!data.success) {

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            requestsContainer.innerHTML = `
                <div class="empty-message">
                    ${data.message || "Unable to load requests."}
                </div>
            `;

            return;
        }


        // NO REQUESTS
        if (data.requests.length === 0) {

            requestsContainer.innerHTML = `
                <div class="empty-message">

                    <h3>
                        No blood requests yet 🩸
                    </h3>

                    <p>
                        You have not submitted any blood requests.
                    </p>

                    <a href="request-blood.html">
                        Create Blood Request
                    </a>

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

            card.className = "request-card";


            // FORMAT DATE
            let requiredDate = "Not specified";

            if (request.required_date) {

                const date =
                    new Date(request.required_date);

                requiredDate =
                    date.toLocaleDateString("en-IN");
            }


            // FORMAT STATUS
            const statusClass =
                request.status.toLowerCase();


            // FORMAT URGENCY
            const urgencyClass =
                request.urgency.toLowerCase();


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
                        🏥 <strong>Hospital:</strong>
                        ${request.hospital_name}
                    </div>

                    <div class="detail">
                        📍 <strong>City:</strong>
                        ${request.city}
                    </div>

                    <div class="detail">
                        🩸 <strong>Units:</strong>
                        ${request.units_required}
                    </div>

                    <div class="detail">
                        📅 <strong>Required Date:</strong>
                        ${requiredDate}
                    </div>

                    <div class="detail">
                        ⚠️ <strong>Urgency:</strong>

                        <span class="urgency ${urgencyClass}">
                            ${request.urgency}
                        </span>

                    </div>

                </div>


                <div class="status-row">

                    <span>
                        Request Status
                    </span>

                    <span class="status ${statusClass}">
                        ${request.status}
                    </span>

                </div>

            `;


            requestsContainer.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        requestsContainer.innerHTML = `
            <div class="empty-message">

                <h3>
                    Server connection failed
                </h3>

                <p>
                    Please make sure the BloodBridge
                    server is running.
                </p>

            </div>
        `;
    }
}


// LOGOUT
if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        try {

            const response =
                await fetch("/api/logout", {
                    method: "POST",
                    credentials: "include"
                });

            const data =
                await response.json();

            if (data.success) {

                window.location.href =
                    "login.html";

            }

        } catch (error) {

            console.error(error);

        }

    });

}


// LOAD DATA
loadMyRequests();