const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createFeedback,
    getMyFeedback,
    getFeedbackByRequest,
    getAllFeedback,
    updateFeedback,
    deleteFeedback
} = require("../controllers/feedbackController");


// User - Submit Feedback
router.post(
    "/",
    authMiddleware,
    roleMiddleware("user"),
    createFeedback
);


// User - Get My Feedback
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("user"),
    getMyFeedback
);


// Admin - Get All Feedback
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllFeedback
);


// Admin - Get Feedback By Request
router.get(
    "/request/:requestId",
    authMiddleware,
    roleMiddleware("admin"),
    getFeedbackByRequest
);


// User - Update Feedback
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("user"),
    updateFeedback
);


// User - Delete Feedback
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("user"),
    deleteFeedback
);


module.exports = router;