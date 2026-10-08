const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
    {
        // Unique reference number shown to users/admin/staff
        requestNumber: {
            type: String,
            unique: true,
            index: true
        },

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

        // Department selected/reviewed for the request
        department: {
            type: String,
            trim: true,
            default: null
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

        // Request location
        location: {
            type: String,
            trim: true,
            default: null
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

        // Status change history
        statusHistory: {
            type: [
                {
                    status: {
                        type: String,
                        enum: [
                            "Pending",
                            "Assigned",
                            "In Progress",
                            "Resolved",
                            "Closed"
                        ],
                        required: true
                    },

                    changedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null
                    },

                    changedAt: {
                        type: Date,
                        default: Date.now
                    },

                    comment: {
                        type: String,
                        trim: true,
                        default: null
                    }
                }
            ],
            default: []
        },

                // Request comments
        comments: {
            type: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true
                    },

                    text: {
                        type: String,
                        required: true,
                        trim: true
                    },

                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],

            default: []
        },

        // ---------------- AI FIELDS ----------------

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

        // Possible duplicate requests detected by AI
        aiDuplicates: {
            type: [
                {
                    requestId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Request"
                    },

                    title: {
                        type: String
                    },

                    similarity: {
                        type: Number
                    },

                    decision: {
                        type: String,
                        enum: ["pending", "confirmed", "rejected"],
                        default: "pending"
                    },

                    reviewedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null
                    },

                    reviewedAt: {
                        type: Date,
                        default: null
                    }
                }
            ],

            default: [],

            // Hidden from normal request responses
            select: false
        },

        aiReviewed: {
            type: Boolean,
            default: false
        },

        aiReviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        aiReviewAction: {
            type: String,
            enum: ["pending", "accepted", "modified"],
            default: "pending"
        },

        aiReviewedAt: {
            type: Date,
            default: null
        },

        // ---------------- OTHER FIELDS ----------------

        attachment: {
            type: String,
            default: null
        },

        resolution: {
            type: String,
            default: null
        },

       resolutionEvidence: {
          type: String,
          default: null
        }
    },
    {
        timestamps: true
    }
);


// Generate request number automatically
requestSchema.pre("validate", function () {
    if (this.isNew && !this.requestNumber) {
        const timestamp = Date.now();
        const random = Math.floor(1000 + Math.random() * 9000);

        this.requestNumber = `SO-${timestamp}-${random}`;
    }
});


const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
