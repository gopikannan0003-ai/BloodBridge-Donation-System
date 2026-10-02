const db = require("../config/database");
const bcrypt = require("bcryptjs");

// Register
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
                console.log(err);
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
                        console.log(err);

                        return res.status(500).json({
                            success: false,
                            message: "Registration failed"
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Registration successful"
                    });
                }
            );
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Login
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
                console.log(err);

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

            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            res.json({
                success: true,
                message: "Login successful",
                user: req.session.user
            });
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }

        res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
};