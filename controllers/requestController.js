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

            // ==========================================
            // FIND MATCHING AVAILABLE DONORS
            // ==========================================

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

                    // ==========================================
                    // NO MATCHING DONOR
                    // ==========================================

                    if (donors.length === 0) {

                        return res.status(201).json({
                            success: true,
                            message:
                                "Blood request created. No matching donor found yet.",
                            requestId: requestId,
                            matchedDonors: 0
                        });
                    }

                    // ==========================================
                    // CREATE DONOR REQUESTS
                    // ==========================================

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