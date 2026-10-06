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