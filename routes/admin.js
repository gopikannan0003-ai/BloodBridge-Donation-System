const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

// Admin Dashboard Statistics
router.get("/stats", adminController.getDashboardStats);

// All Users
router.get("/users", adminController.getAllUsers);

// All Blood Requests
router.get("/requests", adminController.getAllRequests);

module.exports = router;