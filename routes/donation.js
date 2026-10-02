const express = require("express");
const router = express.Router();

const donationController = require("../controllers/donationController");

// Get logged-in donor donation history
router.get(
    "/history",
    donationController.getDonationHistory
);

// Add new donation record
router.post(
    "/add",
    donationController.addDonation
);

module.exports = router;