const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "request",
                "task",
                "assignment",
                "status",
                "system"
            ],
            default: "system"
        },

        relatedRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
            default: null
        },

        relatedTask: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            default: null
        },

        // Optional client-side route for notifications that open a related resource.
        link: {
            type: String,
            trim: true,
            default: null
        },

        // Automatic notifications use this key to remain idempotent when a
        // lifecycle handler is retried or reached through another endpoint.
        notificationKey: {
            type: String,
            trim: true,
            // Keep this field absent for normal notifications so the sparse
            // unique index does not treat them as the same notification.
            default: undefined,
            unique: true,
            sparse: true
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

module.exports = Notification;
