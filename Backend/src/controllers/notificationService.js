const Notification = require("../models/Notification");

const createNotification = async ({
    userId,
    title,
    message,
    type = "system",
    relatedRequest = null,
    relatedTask = null
}) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            relatedRequest,
            relatedTask
        });

        return notification;

    } catch (error) {
        console.error(
            "Notification creation failed:",
            error.message
        );

        return null;
    }
};

module.exports = {
    createNotification
};