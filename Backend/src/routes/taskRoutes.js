const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createTask,
    getAllTasks,
    getMyTasks,
    getTaskById,
    startTask,
    completeTask
} = require("../controllers/taskController");


// Admin - Create Task
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createTask
);


// Admin - Get All Tasks
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllTasks
);


// Staff - Get My Tasks
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("staff"),
    getMyTasks
);


// Staff - Get Task By ID
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("staff", "admin"),
    getTaskById
);


// Staff - Start Task
router.patch(
    "/:id/start",
    authMiddleware,
    roleMiddleware("staff"),
    startTask
);


// Staff - Complete Task
router.patch(
    "/:id/complete",
    authMiddleware,
    roleMiddleware("staff"),
    completeTask
);


module.exports = router;