const db = require("../config/database");

// ==========================================
// SAVE / UPDATE DONOR PROFILE
// ==========================================

exports.saveDonorProfile = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    const userId = req.session.user.id;

    const {
        bloodGroup,
        age,
        gender,
        city,
        address,
        lastDonationDate
    } = req.body;

    if (!bloodGroup || !age || !city) {
        return res.status(400).json({
            success: false,
            message: "Blood group, age and city are required"
        });
    }

    const checkSql = `
        SELECT id
        FROM donors
        WHERE user_id = ?
    `;

    db.query(checkSql, [userId], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }


        // Existing profile → UPDATE
        if (results.length > 0) {

            const donorId = results[0].id;

            const updateSql = `
                UPDATE donors
                SET
                    blood_group = ?,
                    age = ?,
                    gender = ?,
                    city = ?,
                    address = ?,
                    last_donation_date = ?
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [
                    bloodGroup,
                    age,
                    gender || null,
                    city,
                    address || null,
                    lastDonationDate || null,
                    donorId
                ],
                (err) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).json({
                            success: false,
                            message: "Profile update failed"
                        });
                    }

                    res.json({
                        success: true,
                        message: "Donor profile updated successfully"
                    });

                }
            );

        }

        // New profile → INSERT
        else {

            const insertSql = `
                INSERT INTO donors
                (
                    user_id,
                    blood_group,
                    age,
                    gender,
                    city,
                    address,
                    last_donation_date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [
                    userId,
                    bloodGroup,
                    age,
                    gender || null,
                    city,
                    address || null,
                    lastDonationDate || null
                ],
                (err) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).json({
                            success: false,
                            message: "Profile creation failed"
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Donor profile saved successfully"
                    });

                }
            );
        }

    });

};


// ==========================================
// GET DONOR PROFILE
// ==========================================

exports.getDonorProfile = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    const userId = req.session.user.id;

    const sql = `
        SELECT
            id,
            blood_group,
            age,
            gender,
            city,
            address,
            last_donation_date,
            available
        FROM donors
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (results.length === 0) {

            return res.json({
                success: true,
                profileExists: false,
                profile: null
            });

        }

        res.json({
            success: true,
            profileExists: true,
            profile: results[0]
        });

    });

};


// ==========================================
// SEARCH AVAILABLE DONORS
// ==========================================

exports.searchDonors = (req, res) => {

    const bloodGroup = req.query.bloodGroup;
    const city = req.query.city;


    if (!bloodGroup) {

        return res.status(400).json({
            success: false,
            message: "Blood group is required"
        });

    }


    let sql = `
        SELECT
            donors.id,
            users.name,
            users.phone,
            donors.blood_group,
            donors.age,
            donors.gender,
            donors.city,
            donors.address,
            donors.last_donation_date
        FROM donors

        INNER JOIN users
        ON donors.user_id = users.id

        WHERE donors.blood_group = ?
        AND donors.available = TRUE
    `;


    const values = [bloodGroup];


    // City optional
    if (city && city.trim() !== "") {

        sql += `
            AND LOWER(donors.city) = LOWER(?)
        `;

        values.push(city.trim());

    }


    sql += `
        ORDER BY donors.created_at DESC
    `;


    db.query(sql, values, (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Donor search failed"
            });

        }


        res.json({
            success: true,
            count: results.length,
            donors: results
        });

    });

};