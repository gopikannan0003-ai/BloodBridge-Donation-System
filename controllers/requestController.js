const db = require("../config/database");

// ==========================================
// CREATE BLOOD REQUEST
// ==========================================

exports.createRequest = (req, res) => {

    console.log("CREATE REQUEST SESSION:", req.session.user);
    console.log("CREATE REQUEST BODY:", req.body);

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    const seekerId = req.session.user.id;

    const {
        patientName,
        bloodGroup,
        hospitalName,
        city,
        unitsRequired,
        urgency,
        requiredDate
    } = req.body;

    if (
        !patientName ||
        !bloodGroup ||
        !hospitalName ||
        !city ||
        !unitsRequired ||
        !requiredDate
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required fields"
        });
    }

    const insertRequestSql = `
        INSERT INTO blood_requests
        (
            seeker_id,
            patient_name,
            blood_group,
            hospital_name,
            city,
            units_required,
            urgency,
            required_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        insertRequestSql,
        [
            seekerId,
            patientName,
            bloodGroup,
            hospitalName,
            city,
            Number(unitsRequired),
            urgency || "Normal",
            requiredDate
        ],
        (err, result) => {

            if (err) {
                console.log("REQUEST INSERT ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Blood request could not be created",
                    error: err.message
                });
            }

            const requestId = result.insertId;

            console.log(
                "Blood request created. Request ID:",
                requestId
            );

            const donorSql = `
                SELECT d.id
                FROM donors d
                WHERE LOWER(TRIM(d.blood_group)) =
                      LOWER(TRIM(?))
                AND d.available = TRUE
                AND LOWER(TRIM(d.city)) =
                    LOWER(TRIM(?))
            `;

            db.query(
                donorSql,
                [bloodGroup, city],
                (donorErr, donors) => {

                    if (donorErr) {

                        console.log(
                            "DONOR MATCH ERROR:",
                            donorErr
                        );

                        return res.status(201).json({
                            success: true,
                            message:
                                "Blood request created, but donor matching failed.",
                            requestId: requestId,
                            matchedDonors: 0
                        });
                    }

                    if (donors.length === 0) {

                        return res.status(201).json({
                            success: true,
                            message:
                                "Blood request created. No matching donor found yet.",
                            requestId: requestId,
                            matchedDonors: 0
                        });
                    }

                    const donorValues = donors.map((donor) => [
                        requestId,
                        donor.id,
                        "Pending"
                    ]);

                    const donorRequestSql = `
                        INSERT INTO donor_requests
                        (
                            request_id,
                            donor_id,
                            status
                        )
                        VALUES ?
                    `;

                    db.query(
                        donorRequestSql,
                        [donorValues],
                        (insertErr) => {

                            if (insertErr) {

                                console.log(
                                    "DONOR REQUEST INSERT ERROR:",
                                    insertErr
                                );

                                return res.status(201).json({
                                    success: true,
                                    message:
                                        "Blood request created, but donor notification failed.",
                                    requestId: requestId,
                                    matchedDonors: 0
                                });
                            }

                            return res.status(201).json({
                                success: true,
                                message:
                                    "Blood request created and matching donors notified.",
                                requestId: requestId,
                                matchedDonors: donors.length
                            });
                        }
                    );
                }
            );
        }
    );
};


// ==========================================
// GET MY BLOOD REQUESTS
// ==========================================

exports.getMyRequests = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    const sql = `
        SELECT
            id,
            patient_name,
            blood_group,
            hospital_name,
            city,
            units_required,
            urgency,
            required_date,
            status,
            created_at
        FROM blood_requests
        WHERE seeker_id = ?
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        [req.session.user.id],
        (err, results) => {

            if (err) {

                console.log(
                    "GET REQUEST ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to load blood requests"
                });
            }

            return res.json({
                success: true,
                count: results.length,
                requests: results
            });
        }
    );
};


// ==========================================
// SEND REQUEST TO DONOR
// ==========================================

exports.sendDonorRequest = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    const {
        requestId,
        donorId
    } = req.body;

    if (!requestId || !donorId) {
        return res.status(400).json({
            success: false,
            message: "Request ID and Donor ID are required"
        });
    }

    const checkRequestSql = `
        SELECT id
        FROM blood_requests
        WHERE id = ?
        AND seeker_id = ?
    `;

    db.query(
        checkRequestSql,
        [
            requestId,
            req.session.user.id
        ],
        (err, requestResults) => {

            if (err) {

                console.log(
                    "REQUEST VERIFY ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to verify request"
                });
            }

            if (requestResults.length === 0) {

                return res.status(403).json({
                    success: false,
                    message: "Invalid blood request"
                });
            }

            const donorSql = `
                SELECT id
                FROM donors
                WHERE id = ?
                AND available = TRUE
            `;

            db.query(
                donorSql,
                [donorId],
                (err, donorResults) => {

                    if (err) {

                        console.log(
                            "DONOR VERIFY ERROR:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Unable to verify donor"
                        });
                    }

                    if (donorResults.length === 0) {

                        return res.status(404).json({
                            success: false,
                            message: "Donor not available"
                        });
                    }

                    const duplicateSql = `
                        SELECT id
                        FROM donor_requests
                        WHERE request_id = ?
                        AND donor_id = ?
                    `;

                    db.query(
                        duplicateSql,
                        [
                            requestId,
                            donorId
                        ],
                        (err, duplicateResults) => {

                            if (err) {

                                console.log(
                                    "DUPLICATE CHECK ERROR:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Unable to check request"
                                });
                            }

                            if (duplicateResults.length > 0) {

                                return res.status(400).json({
                                    success: false,
                                    message: "Request already sent"
                                });
                            }

                            const insertSql = `
                                INSERT INTO donor_requests
                                (
                                    request_id,
                                    donor_id,
                                    status
                                )
                                VALUES (?, ?, 'Pending')
                            `;

                            db.query(
                                insertSql,
                                [
                                    requestId,
                                    donorId
                                ],
                                (err, result) => {

                                    if (err) {

                                        console.log(
                                            "DONOR REQUEST INSERT ERROR:",
                                            err
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message: "Unable to send request"
                                        });
                                    }

                                    return res.json({
                                        success: true,
                                        message:
                                            "Request sent to donor successfully",
                                        donorRequestId:
                                            result.insertId
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


// ==========================================
// GET REQUESTS FOR LOGGED-IN DONOR
// ==========================================

exports.getDonorRequests = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    const sql = `
        SELECT
            dr.id AS donor_request_id,
            dr.status AS donor_request_status,

            br.id AS request_id,
            br.patient_name,
            br.blood_group,
            br.hospital_name,
            br.city,
            br.units_required,
            br.urgency,
            br.required_date,

            u.name AS seeker_name

        FROM donor_requests dr

        INNER JOIN donors d
            ON dr.donor_id = d.id

        INNER JOIN blood_requests br
            ON dr.request_id = br.id

        INNER JOIN users u
            ON br.seeker_id = u.id

        WHERE d.user_id = ?

        ORDER BY dr.created_at DESC
    `;

    db.query(
        sql,
        [req.session.user.id],
        (err, results) => {

            if (err) {

                console.log(
                    "GET DONOR REQUESTS ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to load donor requests"
                });
            }

            return res.json({
                success: true,
                count: results.length,
                requests: results
            });
        }
    );
};


// ==========================================
// DONOR ACCEPT REQUEST
// ==========================================

exports.acceptDonorRequest = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    const {
        donorRequestId
    } = req.body;

    if (!donorRequestId) {
        return res.status(400).json({
            success: false,
            message: "Donor request ID is required"
        });
    }

    const getRequestSql = `
        SELECT dr.request_id
        FROM donor_requests dr

        INNER JOIN donors d
            ON dr.donor_id = d.id

        WHERE dr.id = ?
        AND d.user_id = ?
    `;

    db.query(
        getRequestSql,
        [
            donorRequestId,
            req.session.user.id
        ],
        (err, results) => {

            if (err) {

                console.log(
                    "GET REQUEST ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to find request"
                });
            }

            if (results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Request not found"
                });
            }

            const requestId =
                results[0].request_id;

            const updateDonorSql = `
                UPDATE donor_requests
                SET status = 'Accepted'
                WHERE id = ?
            `;

            db.query(
                updateDonorSql,
                [donorRequestId],
                (err) => {

                    if (err) {

                        console.log(
                            "UPDATE DONOR REQUEST ERROR:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Unable to accept request"
                        });
                    }

                    const updateBloodSql = `
                        UPDATE blood_requests
                        SET status = 'Accepted'
                        WHERE id = ?
                    `;

                    db.query(
                        updateBloodSql,
                        [requestId],
                        (err) => {

                            if (err) {

                                console.log(
                                    "UPDATE BLOOD REQUEST ERROR:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Blood request status update failed"
                                });
                            }

                            return res.json({
                                success: true,
                                message:
                                    "Blood request accepted successfully"
                            });
                        }
                    );
                }
            );
        }
    );
};


// ==========================================
// DONOR REJECT REQUEST
// ==========================================

exports.rejectDonorRequest = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    const {
        donorRequestId
    } = req.body;

    if (!donorRequestId) {
        return res.status(400).json({
            success: false,
            message: "Donor request ID is required"
        });
    }

    const getRequestSql = `
        SELECT dr.request_id
        FROM donor_requests dr

        INNER JOIN donors d
            ON dr.donor_id = d.id

        WHERE dr.id = ?
        AND d.user_id = ?
    `;

    db.query(
        getRequestSql,
        [
            donorRequestId,
            req.session.user.id
        ],
        (err, results) => {

            if (err) {

                console.log(
                    "GET REQUEST ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to find request"
                });
            }

            if (results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Request not found"
                });
            }

            const requestId =
                results[0].request_id;

            const updateDonorSql = `
                UPDATE donor_requests
                SET status = 'Rejected'
                WHERE id = ?
            `;

            db.query(
                updateDonorSql,
                [donorRequestId],
                (err) => {

                    if (err) {

                        console.log(
                            "UPDATE DONOR REQUEST ERROR:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Unable to reject request"
                        });
                    }

                    const updateBloodSql = `
                        UPDATE blood_requests
                        SET status = 'Cancelled'
                        WHERE id = ?
                        AND status = 'Pending'
                    `;

                    db.query(
                        updateBloodSql,
                        [requestId],
                        (err) => {

                            if (err) {

                                console.log(
                                    "UPDATE BLOOD REQUEST ERROR:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Blood request status update failed"
                                });
                            }

                            return res.json({
                                success: true,
                                message:
                                    "Blood request rejected successfully"
                            });
                        }
                    );
                }
            );
        }
    );
};