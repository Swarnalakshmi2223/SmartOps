const Notification = require("../models/Notification");


// 1. Create Notification
const createNotification = async (req, res) => {
    try {
        const {
            userId,
            title,
            message,
            type,
            relatedRequest,
            relatedTask
        } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                message: "userId, title and message are required"
            });
        }

        const notification = new Notification({
            userId,
            title,
            message,
            type: type || "system",
            relatedRequest: relatedRequest || null,
            relatedTask: relatedTask || null
        });

        await notification.save();

        res.status(201).json({
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create notification",
            error: error.message
        });
    }
};


// 2. Get My Notifications
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user.id
        })
            .populate("relatedRequest", "title status priority")
            .populate("relatedTask", "title status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Notifications fetched successfully",
            count: notifications.length,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
};


// 3. Get Unread Notifications
const getUnreadNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user.id,
            isRead: false
        })
            .populate("relatedRequest", "title status priority")
            .populate("relatedTask", "title status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Unread notifications fetched successfully",
            count: notifications.length,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch unread notifications",
            error: error.message
        });
    }
};


// 4. Mark Notification As Read
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            userId: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        notification.isRead = true;

        await notification.save();

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to mark notification as read",
            error: error.message
        });
    }
};


// 5. Mark All Notifications As Read
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            {
                userId: req.user.id,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );

        res.status(200).json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to mark all notifications as read",
            error: error.message
        });
    }
};


// 6. Delete Notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            userId: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.status(200).json({
            message: "Notification deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete notification",
            error: error.message
        });
    }
};


module.exports = {
    createNotification,
    getMyNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
};