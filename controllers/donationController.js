const db = require("../config/database");

// ==========================================
// GET DONATION HISTORY FOR LOGGED-IN DONOR
// ==========================================

exports.getDonationHistory = (req, res) => {

    // Check login
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    // Only donor can access donation history
    if (req.session.user.role !== "donor") {
        return res.status(403).json({
            success: false,
            message: "Donor access required"
        });
    }

    const userId = req.session.user.id;

    // Find donor ID
    const donorSql = `
        SELECT id
        FROM donors
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(donorSql, [userId], (err, donorResults) => {

        if (err) {
            console.log("DONOR ID ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (donorResults.length === 0) {
            return res.json({
                success: true,
                profileExists: false,
                donations: []
            });
        }

        const donorId = donorResults[0].id;

        // Get donation history
        const sql = `
            SELECT
                id,
                blood_group,
                donation_date,
                hospital_name,
                city,
                units_donated,
                status,
                created_at
            FROM donations
            WHERE donor_id = ?
            ORDER BY donation_date DESC, id DESC
        `;

        db.query(sql, [donorId], (err, results) => {

            if (err) {
                console.log("DONATION HISTORY ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to load donation history"
                });
            }

            res.json({
                success: true,
                profileExists: true,
                count: results.length,
                donations: results
            });
        });
    });
};


// ==========================================
// ADD DONATION RECORD
// ==========================================

exports.addDonation = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    if (req.session.user.role !== "donor") {
        return res.status(403).json({
            success: false,
            message: "Donor access required"
        });
    }

    const {
        blood_group,
        donation_date,
        hospital_name,
        city,
        units_donated
    } = req.body;

    if (!blood_group || !donation_date) {
        return res.status(400).json({
            success: false,
            message: "Blood group and donation date are required"
        });
    }

    const userId = req.session.user.id;

    // Find donor
    const donorSql = `
        SELECT id
        FROM donors
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(donorSql, [userId], (err, donorResults) => {

        if (err) {
            console.log("DONOR SEARCH ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (donorResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Donor profile not found"
            });
        }

        const donorId = donorResults[0].id;

        const sql = `
            INSERT INTO donations
            (
                donor_id,
                blood_group,
                donation_date,
                hospital_name,
                city,
                units_donated,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'Completed')
        `;

        db.query(
            sql,
            [
                donorId,
                blood_group,
                donation_date,
                hospital_name || null,
                city || null,
                units_donated || 1
            ],
            (err, result) => {

                if (err) {
                    console.log("ADD DONATION ERROR:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to add donation"
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "Donation record added successfully",
                    donationId: result.insertId
                });
            }
        );
    });
};