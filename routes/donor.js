const express = require("express");

const router = express.Router();

const {
    saveDonorProfile,
    getDonorProfile,
    searchDonors
} = require("../controllers/donorController");


// Save donor profile

router.post("/profile", saveDonorProfile);


// Get logged-in donor profile

router.get("/profile", getDonorProfile);


// Search available donors

router.get("/search", searchDonors);


module.exports = router;