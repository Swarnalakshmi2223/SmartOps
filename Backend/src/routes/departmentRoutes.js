const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    updateDepartmentStatus
} = require("../controllers/departmentController");


router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createDepartment
);


router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllDepartments
);


router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getDepartmentById
);


router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateDepartment
);


router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateDepartmentStatus
);


module.exports = router;