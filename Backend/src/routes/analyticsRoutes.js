const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getDashboardAnalytics,
    getCategoryAnalytics,
    getStaffPerformance
} = require("../controllers/analyticsController");
router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("admin"),
    getDashboardAnalytics
);

router.get(
    "/categories",
    authMiddleware,
    roleMiddleware("admin"),
    getCategoryAnalytics
);


router.get(
    "/staff-performance",
    authMiddleware,
    roleMiddleware("admin"),
    getStaffPerformance
);

module.exports = router;
