const express = require("express");
const cors = require("cors");
const session = require("express-session");

const db = require("./config/database");

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donor");
const requestRoutes = require("./routes/request");
const adminRoutes = require("./routes/admin");
const donationRoutes = require("./routes/donation");

// AI BLOOD ASSISTANT ROUTE
const bloodAssistantRoutes = require("./routes/bloodAssistant");

const app = express();
const PORT = 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ==========================================
// SESSION
// ==========================================

app.use(
    session({
        secret: "bloodbridge_secret_key",
        resave: false,
        saveUninitialized: false,

        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: false
        }
    })
);

// ==========================================
// STATIC FILES
// ==========================================

app.use(express.static("public"));

// ==========================================
// AUTH ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

// ==========================================
// DONOR ROUTES
// ==========================================

app.use("/api/donor", donorRoutes);

// ==========================================
// BLOOD REQUEST ROUTES
// ==========================================

app.use("/api/request", requestRoutes);

// ==========================================
// ADMIN ROUTES
// ==========================================

app.use("/api/admin", adminRoutes);

// ==========================================
// DONATION HISTORY ROUTES
// ==========================================

app.use("/api/donation", donationRoutes);

// ==========================================
// AI BLOOD ASSISTANT ROUTES
// ==========================================

app.use("/api/blood-assistant", bloodAssistantRoutes);

// ==========================================
// TEST API
// ==========================================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "BloodBridge API is working!"
    });

});

// ==========================================
// CURRENT USER
// ==========================================

app.get("/api/user", (req, res) => {

    if (!req.session.user) {

        return res.json({
            success: false,
            message: "User is not logged in"
        });

    }

    res.json({
        success: true,
        user: req.session.user
    });

});

// ==========================================
// LOGOUT
// ==========================================

app.post("/api/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });

        }

        res.clearCookie("connect.sid");

        res.json({
            success: true,
            message: "Logged out successfully"
        });

    });

});

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found"
    });

});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `BloodBridge server running at http://localhost:${PORT}`
    );

});

