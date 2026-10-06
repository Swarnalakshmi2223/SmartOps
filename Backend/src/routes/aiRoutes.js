const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    analyzeRequestController,
    detectDuplicateRequests,
    analyzeAndStoreAI,
    reviewAIAnalysis
} = require("../controllers/aiController");


router.post(
    "/analyze",
    authMiddleware,
    roleMiddleware("user"),
    analyzeRequestController
);


router.post(
    "/duplicates",
    authMiddleware,
    roleMiddleware("user"),
    detectDuplicateRequests
);


router.post(
    "/analyze/:requestId",
    authMiddleware,
    roleMiddleware("user"),
    analyzeAndStoreAI
);

router.patch(
    "/review/:requestId",
    authMiddleware,
    roleMiddleware("admin"),
    reviewAIAnalysis
);

module.exports = router;