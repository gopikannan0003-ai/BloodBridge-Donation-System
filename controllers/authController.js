const db = require("../config/database");
const bcrypt = require("bcryptjs");

// ===============================
// REGISTER
// ===============================
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const checkUser = "SELECT id FROM users WHERE email = ?";

        db.query(checkUser, [email], async (err, results) => {

            if (err) {
                console.log("Register database error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = `
                INSERT INTO users
                (name, email, phone, password, role)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    name,
                    email,
                    phone,
                    hashedPassword,
                    role || "seeker"
                ],
                (err, result) => {

                    if (err) {
                        console.log("Registration insert error:", err);

                        return res.status(500).json({
                            success: false,
                            message: "Registration failed"
                        });
                    }

                    return res.status(201).json({
                        success: true,
                        message: "Registration successful"
                    });
                }
            );
        });

    } catch (error) {

        console.log("Register server error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ===============================
// LOGIN
// ===============================
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const sql = "SELECT * FROM users WHERE email = ?";

        db.query(sql, [email], async (err, results) => {

            if (err) {

                console.log("Login database error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // Create session
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            // Make sure session is saved before sending response
            req.session.save((sessionError) => {

                if (sessionError) {

                    console.log(
                        "Session save error:",
                        sessionError
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Session could not be saved"
                    });
                }

                console.log(
                    "User logged in:",
                    req.session.user.email
                );

                return res.json({
                    success: true,
                    message: "Login successful",
                    user: req.session.user
                });
            });
        });

    } catch (error) {

        console.log("Login server error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ===============================
// LOGOUT
// ===============================
exports.logout = (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            console.log("Logout error:", err);

            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        return res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
};