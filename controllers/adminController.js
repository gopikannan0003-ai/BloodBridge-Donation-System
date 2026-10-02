const db = require("../config/database");

// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================

exports.getDashboardStats = (req, res) => {

    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM users) AS totalUsers,
            (SELECT COUNT(*) FROM donors) AS totalDonors,
            (SELECT COUNT(*) FROM blood_requests WHERE status = 'Pending') AS pendingRequests,
            (SELECT COUNT(*) FROM blood_requests WHERE status = 'Accepted') AS acceptedRequests,
            (SELECT COUNT(*) FROM blood_requests WHERE status = 'Completed') AS completedRequests,
            (SELECT COUNT(*) FROM blood_requests WHERE status = 'Cancelled') AS cancelledRequests
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("ADMIN DASHBOARD ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Unable to load dashboard statistics"
            });
        }

        res.json({
            success: true,
            stats: results[0]
        });
    });
};


// ==========================================
// GET ALL USERS
// ==========================================

exports.getAllUsers = (req, res) => {

    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            role,
            created_at
        FROM users
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("GET USERS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Unable to load users"
            });
        }

        res.json({
            success: true,
            count: results.length,
            users: results
        });
    });
};


// ==========================================
// GET ALL BLOOD REQUESTS
// ==========================================

exports.getAllRequests = (req, res) => {

    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    const sql = `
        SELECT
            br.id,
            br.patient_name,
            br.blood_group,
            br.hospital_name,
            br.city,
            br.units_required,
            br.urgency,
            br.required_date,
            br.status,
            br.created_at,
            u.name AS seeker_name,
            u.phone AS seeker_phone
        FROM blood_requests br
        INNER JOIN users u
            ON br.seeker_id = u.id
        ORDER BY br.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("GET ALL REQUESTS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Unable to load blood requests"
            });
        }

        res.json({
            success: true,
            count: results.length,
            requests: results
        });
    });
};