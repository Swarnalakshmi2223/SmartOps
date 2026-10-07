const Notification = require("../models/Notification");


// Create Automatic Notification
const createAutomaticNotification = async ({
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

        console.log(
            `Automatic notification created for user: ${userId}`
        );

        return notification;

    } catch (error) {

        console.error(
            "Automatic notification creation failed:",
            error.message
        );

        return null;
    }
};


module.exports = {
    createAutomaticNotification
};