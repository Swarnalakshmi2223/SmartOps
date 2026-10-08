const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const User = require("../models/User");

let io;

const getId = (value) => {
    if (!value) {
        return null;
    }

    return value._id ? value._id.toString() : value.toString();
};

const toPlainObject = (value) => {
    if (!value) {
        return value;
    }

    return typeof value.toObject === "function"
        ? value.toObject()
        : value;
};

const initializeSocket = (httpServer, frontendOrigin) => {
    io = new Server(httpServer, {
        cors: {
            origin: frontendOrigin,
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers.authorization?.replace(
                    /^Bearer\s+/i,
                    ""
                );

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("_id role isActive");

            if (!user || user.isActive === false) {
                return next(new Error("Account is not active"));
            }

            socket.data.user = {
                id: user._id.toString(),
                role: user.role
            };
            return next();
        } catch (error) {
            return next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        const user = socket.data.user;
        const userId = getId(user.id);

        socket.join(`user:${userId}`);
        socket.join(`role:${user.role}`);

        console.log(
            `Socket connected: ${user.role} ${userId}`
        );

        socket.on("disconnect", (reason) => {
            console.log(
                `Socket disconnected: ${user.role} ${userId} (${reason})`
            );
        });
    });

    return io;
};

const emitToUser = (userId, event, payload) => {
    if (!io || !userId) {
        return;
    }

    io.to(`user:${getId(userId)}`).emit(event, payload);
};

const emitToRole = (role, event, payload) => {
    if (!io || !role) {
        return;
    }

    io.to(`role:${role}`).emit(event, payload);
};

const emitRequestEvent = (event, request, extra = {}) => {
    const requestData = toPlainObject(request);
    const payload = {
        ...extra,
        requestId: getId(requestData?._id),
        request: requestData
    };
    const recipients = new Set([
        getId(requestData?.createdBy),
        getId(requestData?.assignedTo)
    ]);

    recipients.forEach((userId) => emitToUser(userId, event, payload));
    emitToRole("admin", event, payload);
};

const emitTaskEvent = (event, task, extra = {}) => {
    const taskData = toPlainObject(task);
    const payload = {
        ...extra,
        taskId: getId(taskData?._id),
        task: taskData
    };

    emitToUser(taskData?.assignedTo, event, payload);
    emitToRole("admin", event, payload);
};

const emitNotificationCreated = (notification) => {
    const notificationData = toPlainObject(notification);

    emitToUser(
        notificationData?.userId,
        "notification.created",
        {
            notification: notificationData
        }
    );
};

module.exports = {
    initializeSocket,
    emitToUser,
    emitToRole,
    emitRequestEvent,
    emitTaskEvent,
    emitNotificationCreated
};
