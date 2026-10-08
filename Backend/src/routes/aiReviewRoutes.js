const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getAIReview,
    reviewAISuggestion,
    reviewDuplicate
} = require("../controllers/aiReviewController");
// Admin confirms or rejects duplicate
router.patch(
    "/:requestId/duplicate/:duplicateRequestId",
    authMiddleware,
    roleMiddleware("admin"),
    reviewDuplicate
);


// Admin gets AI review details
router.get(
    "/:requestId",
    authMiddleware,
    roleMiddleware("admin"),
    getAIReview
);


// Admin accepts or modifies AI suggestion
router.patch(
    "/:requestId",
    authMiddleware,
    roleMiddleware("admin"),
    reviewAISuggestion
);


module.exports = router;
