const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getRequestReport,
    getCategoryReport,
    getStaffWorkloadReport,
    getDateBasedReport
} = require("../controllers/reportController");

router.get(
    "/requests",
    authMiddleware,
    roleMiddleware("admin"),
    getRequestReport
);

router.get(
    "/categories",
    authMiddleware,
    roleMiddleware("admin"),
    getCategoryReport
);

router.get(
    "/staff-workload",
    authMiddleware,
    roleMiddleware("admin"),
    getStaffWorkloadReport
);


router.get(
    "/requests/date",
    authMiddleware,
    roleMiddleware("admin"),
    getDateBasedReport
);


module.exports = router;