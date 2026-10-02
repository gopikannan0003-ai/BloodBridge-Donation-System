const express = require("express");
const router = express.Router();

const db = require("../config/database");

// ======================================================
// BLOOD GROUP COMPATIBILITY
// ======================================================

const validBloodGroups = [
    "A+", "A-",
    "B+", "B-",
    "AB+", "AB-",
    "O+", "O-"
];

// ======================================================
// AI BLOOD ASSISTANT
// ======================================================

router.post("/chat", (req, res) => {

    const { message } = req.body;

    if (!message || message.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Please enter a message"
        });
    }

    const originalText = message.trim();
    const text = originalText.toLowerCase();

    // ==================================================
    // HELLO
    // ==================================================

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey") ||
        text.includes("வணக்கம்") ||
        text.includes("vanakkam")
    ) {

        return res.json({
            success: true,
            type: "general",
            reply: `
                👋 Hello! I'm your <b>BloodBridge AI Assistant</b>.
                <br><br>
                I can help you with:
                <br>🩸 Finding blood donors
                <br>❤️ Blood donation
                <br>📋 Blood requests
                <br>🔎 Searching donors by blood group and city
                <br>💬 English, Tamil and Tanglish questions
                <br>🎤 Voice input
            `
        });
    }

    // ==================================================
    // DONATION GUIDANCE
    // ==================================================

    if (
        text.includes("donate") ||
        text.includes("donation") ||
        text.includes("blood donate") ||
        text.includes("ரத்தம் கொடுக்க") ||
        text.includes("ரத்த தானம்") ||
        text.includes("ratham koduka") ||
        text.includes("ratha danam")
    ) {

        return res.json({
            success: true,
            type: "donation",
            reply: `
                ❤️ <b>Blood Donation Guidance</b>
                <br><br>
                To donate through BloodBridge:
                <br>1️⃣ Complete your donor profile.
                <br>2️⃣ Add your blood group, age and city.
                <br>3️⃣ Keep your donor availability updated.
                <br>4️⃣ Check available blood requests.
                <br><br>
                🩸 If you have any medical concerns about donating,
                please check with a qualified healthcare professional.
            `
        });
    }

    // ==================================================
    // BLOOD REQUEST GUIDANCE
    // ==================================================

    if (
        text.includes("create request") ||
        text.includes("blood request") ||
        text.includes("request blood") ||
        text.includes("need blood") ||
        text.includes("blood needed") ||
        text.includes("blood required") ||
        text.includes("ரத்தம் வேண்டும்") ||
        text.includes("ரத்தம் தேவை") ||
        text.includes("blood venum") ||
        text.includes("blood venum") ||
        text.includes("ratham venum") ||
        text.includes("ratham thevai")
    ) {

        return res.json({
            success: true,
            type: "request",
            reply: `
                🩸 <b>Blood Request</b>
                <br><br>
                To create a blood request, you normally need:
                <br>👤 Patient name
                <br>🩸 Blood group
                <br>🏥 Hospital name
                <br>📍 City
                <br>🧪 Units required
                <br>🚨 Urgency
                <br>📅 Required date
                <br><br>
                After submitting the request, you can track its status from <b>My Requests</b>.
            `
        });
    }

    // ==================================================
    // FIND DONOR - WITHOUT SPECIFIC BLOOD GROUP
    // ==================================================

    if (
        text.includes("find donor") ||
        text.includes("find a donor") ||
        text.includes("available donor") ||
        text.includes("search donor") ||
        text.includes("donor find") ||
        text.includes("donor venum") ||
        text.includes("donor thevai") ||
        text.includes("donor தேவை")
    ) {

        return res.json({
            success: true,
            type: "donor_search",
            reply: `
                🔎 <b>Find a Blood Donor</b>
                <br><br>
                Please provide the blood group and city.
                <br><br>
                Example:
                <br>👉 <b>Find B+ donor in Trichy</b>
                <br>👉 <b>எனக்கு B+ blood Trichy-ல தேவை</b>
            `
        });
    }

    // ==================================================
    // EXTRACT BLOOD GROUP
    // ==================================================

    let detectedBloodGroup = null;

    for (const group of validBloodGroups) {

        if (text.includes(group.toLowerCase())) {
            detectedBloodGroup = group;
            break;
        }
    }

    // ==================================================
    // EXTRACT CITY
    // ==================================================

    let detectedCity = null;

    const cityPatterns = [
        /in\s+([a-zA-Z][a-zA-Z\s]{2,30})/i,
        /at\s+([a-zA-Z][a-zA-Z\s]{2,30})/i,
        /near\s+([a-zA-Z][a-zA-Z\s]{2,30})/i
    ];

    for (const pattern of cityPatterns) {

        const match = originalText.match(pattern);

        if (match) {

            let city = match[1].trim();

            city = city
                .replace(
                    /\b(blood|donor|needed|required|please|available)\b/gi,
                    ""
                )
                .trim();

            if (city.length >= 2) {
                detectedCity = city;
                break;
            }
        }
    }

    // ==================================================
    // DATABASE DONOR SEARCH
    // ==================================================

    if (detectedBloodGroup) {

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

        const values = [detectedBloodGroup];

        if (detectedCity) {

            sql += `
                AND LOWER(donors.city) = LOWER(?)
            `;

            values.push(detectedCity);
        }

        sql += `
            ORDER BY donors.created_at DESC
        `;

        db.query(sql, values, (err, results) => {

            if (err) {

                console.log(
                    "AI DONOR SEARCH ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to search donors"
                });
            }

            if (results.length === 0) {

                const locationText =
                    detectedCity
                        ? ` in <b>${detectedCity}</b>`
                        : "";

                return res.json({
                    success: true,
                    type: "donor_search",
                    bloodGroup: detectedBloodGroup,
                    city: detectedCity,
                    count: 0,
                    donors: [],
                    reply: `
                        🔎 I searched BloodBridge for
                        <b>${detectedBloodGroup}</b> donors${locationText}.
                        <br><br>
                        😔 No currently available donor was found
                        with these search details.
                        <br><br>
                        You can try another city or use the
                        <b>Find Blood</b> section.
                    `
                });
            }

            let donorList = "";

            results.slice(0, 10).forEach((donor, index) => {

                donorList += `
                    <div style="
                        margin-top:10px;
                        padding:10px;
                        border:1px solid #ddd;
                        border-radius:8px;
                    ">
                        <b>${index + 1}. ${donor.name}</b>
                        <br>
                        🩸 ${donor.blood_group}
                        <br>
                        📍 ${donor.city}
                        <br>
                        📞 ${donor.phone}
                    </div>
                `;
            });

            const locationText =
                detectedCity
                    ? ` in <b>${detectedCity}</b>`
                    : "";

            return res.json({
                success: true,
                type: "donor_search",
                bloodGroup: detectedBloodGroup,
                city: detectedCity,
                count: results.length,
                donors: results,
                reply: `
                    🩸 I found <b>${results.length}</b>
                    available <b>${detectedBloodGroup}</b>
                    donor(s)${locationText}.
                    <br><br>
                    ${donorList}
                    <br>
                    🔎 Showing up to 10 available donors.
                `
            });
        });

        return;
    }

    // ==================================================
    // GENERAL HELP
    // ==================================================

    return res.json({
        success: true,
        type: "general",
        reply: `
            🤖 <b>BloodBridge AI Assistant</b>
            <br><br>
            I can help you with:
            <br>🩸 Find blood
            <br>🔎 Search donors using blood group and city
            <br>❤️ Blood donation guidance
            <br>📋 Blood request guidance
            <br><br>
            Try:
            <br>👉 <b>Find B+ donor in Trichy</b>
            <br>👉 <b>I need O+ blood</b>
            <br>👉 <b>How can I donate blood?</b>
            <br>👉 <b>How do I create a blood request?</b>
        `
    });

});

module.exports = router;