const Notification = require("../models/Notification");
const User = require("../models/User");
const {
    emitNotificationCreated
} = require("../socket/socketServer");


// Create Automatic Notification
const createAutomaticNotification = async ({
    userId,
    title,
    message,
    type = "system",
    relatedRequest = null,
    relatedTask = null,
    link = null,
    notificationKey = null
}) => {
    try {

        if (notificationKey) {
            const existing = await Notification.findOne({ notificationKey });
            if (existing) {
                return existing;
            }
        }

        const notificationData = {
            userId,
            title,
            message,
            type,
            relatedRequest,
            relatedTask,
            link
        };

        if (notificationKey) {
            notificationData.notificationKey = notificationKey;
        }

        const notification = await Notification.create(notificationData);

        emitNotificationCreated(notification);

        console.log(
            `Automatic notification created for user: ${userId}`
        );

        return notification;

    } catch (error) {

        console.error(
            "Automatic notification creation failed:",
            error.message
        );

        if (error.code === 11000 && notificationKey) {
            return Notification.findOne({ notificationKey });
        }

        return null;
    }
};

const notifyActiveAdministrators = async ({
    request,
    event,
    title,
    actorId = null,
    requesterName = null
}) => {
    try {
        if (!request?._id) {
            return [];
        }

        const [admins, requester] = await Promise.all([
            User.find({ role: "admin", isActive: { $ne: false } })
                .select("_id")
                .lean(),
            requesterName
                ? null
                : User.findById(request.createdBy).select("name").lean()
        ]);

        const requestId = request._id.toString();
        const requesterLabel = requesterName || requester?.name || "Unknown requester";
        const requestNumber = request.requestNumber || requestId;
        const priority = request.priority || "Medium";
        const link = `/admin/requests/${requestId}`;

        const notifications = [];
        for (const admin of admins) {
            if (admin._id.toString() === actorId?.toString()) {
                continue;
            }

            notifications.push(await createAutomaticNotification({
                userId: admin._id,
                title,
                message: `${title}: "${request.title}" (${requestNumber}) - requester: ${requesterLabel}; priority: ${priority}. Open request: ${link}`,
                type: "request",
                relatedRequest: request._id,
                link,
                notificationKey: `request:${requestId}:admin:${admin._id}:event:${event}`
            }));
        }

        return notifications.filter(Boolean);
    } catch (error) {
        console.error("Administrator notification flow failed:", error.message);
        return [];
    }
};


module.exports = {
    createAutomaticNotification,
    notifyActiveAdministrators
};
