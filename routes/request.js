const express = require("express");

const router = express.Router();

const requestController = require("../controllers/requestController");

// ==========================================
// CREATE BLOOD REQUEST
// ==========================================

router.post(
    "/",
    requestController.createRequest
);


// ==========================================
// GET MY BLOOD REQUESTS
// ==========================================

router.get(
    "/my",
    requestController.getMyRequests
);


// ==========================================
// SEND REQUEST TO DONOR
// ==========================================

router.post(
    "/send-donor",
    requestController.sendDonorRequest
);


// ==========================================
// GET DONOR REQUESTS
// ==========================================

router.get(
    "/donor",
    requestController.getDonorRequests
);


// ==========================================
// DONOR ACCEPT REQUEST
// ==========================================

router.put(
    "/donor/accept",
    requestController.acceptDonorRequest
);


// ==========================================
// DONOR REJECT REQUEST
// ==========================================

router.put(
    "/donor/reject",
    requestController.rejectDonorRequest
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
