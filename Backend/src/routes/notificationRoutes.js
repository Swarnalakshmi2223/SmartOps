const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createNotification,
    getMyNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} = require("../controllers/notificationController");


// Admin - Create Notification
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createNotification
);


// Get My Notifications
router.get(
    "/",
    authMiddleware,
    getMyNotifications
);


// Get Unread Notifications
router.get(
    "/unread",
    authMiddleware,
    getUnreadNotifications
);


// Mark All Notifications As Read
router.patch(
    "/read-all",
    authMiddleware,
    markAllNotificationsAsRead
);


// Mark One Notification As Read
router.patch(
    "/:id/read",
    authMiddleware,
    markNotificationAsRead
);


// Delete Notification
router.delete(
    "/:id",
    authMiddleware,
    deleteNotification
);


module.exports = router;