// ==========================================
// BLOODBRIDGE ADMIN DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
    setupLogout();
});


// ==========================================
// LOAD DASHBOARD STATISTICS
// ==========================================

async function loadDashboardStats() {

    try {

        const response = await fetch("/api/admin/stats", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {

            alert(data.message || "Admin access required");

            window.location.href = "login.html";

            return;
        }

        const stats = data.stats;

        document.getElementById("totalUsers").textContent =
            stats.totalUsers || 0;

        document.getElementById("totalDonors").textContent =
            stats.totalDonors || 0;

        document.getElementById("pendingRequests").textContent =
            stats.pendingRequests || 0;

        document.getElementById("acceptedRequests").textContent =
            stats.acceptedRequests || 0;

        document.getElementById("completedRequests").textContent =
            stats.completedRequests || 0;

        document.getElementById("cancelledRequests").textContent =
            stats.cancelledRequests || 0;

    } catch (error) {

        console.error("Dashboard error:", error);

        alert("Unable to connect to server.");

    }
}


// ==========================================
// SHOW USERS
// ==========================================

async function showUsers() {

    const usersSection =
        document.getElementById("usersSection");

    const requestsSection =
        document.getElementById("requestsSection");

    const container =
        document.getElementById("usersContainer");

    requestsSection.style.display = "none";

    usersSection.style.display = "block";

    container.innerHTML =
        `<div class="loading">Loading users...</div>`;

    try {

        const response = await fetch("/api/admin/users", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {

            container.innerHTML = `
                <div class="empty-message">
                    ${data.message || "Unable to load users"}
                </div>
            `;

            return;
        }

        if (data.users.length === 0) {

            container.innerHTML = `
                <div class="empty-message">
                    No users found.
                </div>
            `;

            return;
        }

        let tableHTML = `
            <table class="admin-table">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Created</th>
                    </tr>

                </thead>

                <tbody>
        `;

        data.users.forEach(user => {

            tableHTML += `
                <tr>

                    <td>${user.id}</td>

                    <td>${escapeHTML(user.name)}</td>

                    <td>${escapeHTML(user.email)}</td>

                    <td>${escapeHTML(user.phone)}</td>

                    <td>${escapeHTML(user.role)}</td>

                    <td>
                        ${formatDate(user.created_at)}
                    </td>

                </tr>
            `;

        });

        tableHTML += `
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;

        usersSection.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error("Users error:", error);

        container.innerHTML = `
            <div class="empty-message">
                Server connection failed.
            </div>
        `;
    }
}


// ==========================================
// SHOW BLOOD REQUESTS
// ==========================================

async function showRequests() {

    const usersSection =
        document.getElementById("usersSection");

    const requestsSection =
        document.getElementById("requestsSection");

    const container =
        document.getElementById("requestsContainer");

    usersSection.style.display = "none";

    requestsSection.style.display = "block";

    container.innerHTML =
        `<div class="loading">Loading blood requests...</div>`;

    try {

        const response = await fetch("/api/admin/requests", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {

            container.innerHTML = `
                <div class="empty-message">
                    ${data.message || "Unable to load requests"}
                </div>
            `;

            return;
        }

        if (data.requests.length === 0) {

            container.innerHTML = `
                <div class="empty-message">
                    No blood requests found.
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        data.requests.forEach(request => {

            const card = document.createElement("div");

            card.className = "request-card";

            card.innerHTML = `

                <h3>
                    🩸 ${escapeHTML(request.blood_group)}
                    - ${escapeHTML(request.patient_name)}
                </h3>

                <p>
                    🏥 <strong>Hospital:</strong>
                    ${escapeHTML(request.hospital_name)}
                </p>

                <p>
                    📍 <strong>City:</strong>
                    ${escapeHTML(request.city)}
                </p>

                <p>
                    🧪 <strong>Units:</strong>
                    ${request.units_required}
                </p>

                <p>
                    🚨 <strong>Urgency:</strong>
                    ${escapeHTML(request.urgency)}
                </p>

                <p>
                    📅 <strong>Required Date:</strong>
                    ${formatDate(request.required_date)}
                </p>

                <p>
                    👤 <strong>Requested By:</strong>
                    ${escapeHTML(request.seeker_name)}
                </p>

                <p>
                    📞 <strong>Phone:</strong>
                    ${escapeHTML(request.seeker_phone)}
                </p>

                <p>
                    📌 <strong>Status:</strong>
                    <span class="status">
                        ${escapeHTML(request.status)}
                    </span>
                </p>

                <p>
                    🕒 <strong>Created:</strong>
                    ${formatDate(request.created_at)}
                </p>

            `;

            container.appendChild(card);

        });

        requestsSection.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error("Requests error:", error);

        container.innerHTML = `
            <div class="empty-message">
                Server connection failed.
            </div>
        `;
    }
}


// ==========================================
// HIDE SECTIONS
// ==========================================

function hideSections() {

    document.getElementById("usersSection").style.display =
        "none";

    document.getElementById("requestsSection").style.display =
        "none";
}


// ==========================================
// LOGOUT
// ==========================================

function setupLogout() {

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {

        try {

            const response = await fetch("/api/logout", {
                method: "POST",
                credentials: "include"
            });

            const data = await response.json();

            if (data.success) {

                window.location.href = "login.html";

            } else {

                alert("Logout failed.");

            }

        } catch (error) {

            console.error("Logout error:", error);

            alert("Server connection failed.");

        }

    });
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}