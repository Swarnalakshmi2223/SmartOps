const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium"
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Assigned",
                "In Progress",
                "Resolved",
                "Closed"
            ],
            default: "Pending"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        aiCategory: {
            type: String,
            default: null
        },

        aiDepartment: {
            type: String,
            default: null
        },

        aiPriority: {
            type: String,
            default: null
        },

        aiCategoryScore: {
            type: Number,
            default: 0
        },

        aiDepartmentScore: {
            type: Number,
            default: 0
        },

        aiPriorityScore: {
            type: Number,
            default: 0
        },

        aiAnalyzedAt: {
            type: Date,
            default: null
        },

        attachment: {
            type: String,
            default: null
        },

        resolution: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;