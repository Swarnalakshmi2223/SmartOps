const mongoose = require("mongoose");

const Request = require("../models/Request");
const Category = require("../models/Category");
const Department = require("../models/Department");


// ======================================================
// Get AI Review Details
// ======================================================
const getAIReview = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: "Invalid request ID"
            });
        }

        const request = await Request.findById(requestId)
            .select(
                "+aiDuplicates aiCategory aiDepartment aiPriority aiCategoryScore aiDepartmentScore aiPriorityScore aiAnalyzedAt aiReviewed aiReviewedBy aiReviewAction aiReviewedAt title description category priority status"
            )
            .populate("aiReviewedBy", "name email role");

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        res.status(200).json({
            message: "AI review details fetched successfully",
            request
        });

    } catch (error) {
        console.error("Get AI review error:", error);

        res.status(500).json({
            message: "Failed to fetch AI review details",
            error: error.message
        });
    }
};


// ======================================================
// Accept / Modify AI Suggestion
// ======================================================
const reviewAISuggestion = async (req, res) => {
    try {
        const { requestId } = req.params;

        const {
            action,
            category,
            department,
            priority
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: "Invalid request ID"
            });
        }

        if (!["accept", "modified"].includes(action)) {
            return res.status(400).json({
                message: "Action must be accept or modified"
            });
        }

        const request = await Request.findById(requestId)
            .select(
                "+aiDuplicates aiCategory aiDepartment aiPriority aiCategoryScore aiDepartmentScore aiPriorityScore aiAnalyzedAt aiReviewed aiReviewedBy aiReviewAction aiReviewedAt title description category priority"
            );

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (!request.aiAnalyzedAt) {
            return res.status(400).json({
                message: "AI analysis has not been performed for this request"
            });
        }

        let finalCategory = request.category;
        let finalDepartment = request.department;
        let finalPriority = request.priority;

        // ----------------------------------------------
        // Accept AI suggestion
        // ----------------------------------------------
        if (action === "accept") {

            if (request.aiCategory) {
                finalCategory = request.aiCategory;
            }

            if (request.aiPriority) {
                finalPriority = request.aiPriority;
            }

            if (request.aiDepartment) {
                finalDepartment = request.aiDepartment;
            }
        }

        // ----------------------------------------------
        // Modify AI suggestion
        // ----------------------------------------------
        if (action === "modified") {

            if (!category || !department || !priority) {
                return res.status(400).json({
                    message: "Category, department and priority are required when modifying"
                });
            }

            finalCategory = category;
            finalDepartment = department;
            finalPriority = priority;
        }

        // Validate priority
        const allowedPriorities = [
            "Low",
            "Medium",
            "High",
            "Critical"
        ];

        if (!allowedPriorities.includes(finalPriority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        // Check category exists and is active
        const categoryExists = await Category.findOne({
            name: finalCategory,
            isActive: { $ne: false }
        });

        if (!categoryExists) {
            return res.status(400).json({
                message: "Selected category is not active"
            });
        }

        const departmentExists = await Department.findOne({
            name: finalDepartment,
            isActive: { $ne: false }
        });

        if (!departmentExists) {
            return res.status(400).json({
                message: "Selected department is not active"
            });
        }

        request.category = finalCategory;
        request.department = finalDepartment;
        request.priority = finalPriority;

        request.aiReviewed = true;
        request.aiReviewedBy = req.user.id;
        request.aiReviewAction =
            action === "accept"
                ? "accepted"
                : "modified";
        request.aiReviewedAt = new Date();

        await request.save();

        res.status(200).json({
            message:
                action === "accept"
                    ? "AI suggestion accepted successfully"
                    : "AI suggestion modified successfully",

            request
        });

    } catch (error) {
        console.error("Review AI suggestion error:", error);

        res.status(500).json({
            message: "Failed to review AI suggestion",
            error: error.message
        });
    }
};


// ======================================================
// Confirm / Reject Duplicate
// ======================================================
const reviewDuplicate = async (req, res) => {
    try {
        const {
            requestId,
            duplicateRequestId
        } = req.params;

        const { decision } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(requestId) ||
            !mongoose.Types.ObjectId.isValid(duplicateRequestId)
        ) {
            return res.status(400).json({
                message: "Invalid request ID"
            });
        }

        if (!["confirmed", "rejected"].includes(decision)) {
            return res.status(400).json({
                message: "Decision must be confirmed or rejected"
            });
        }

        const request = await Request.findById(requestId)
            .select("+aiDuplicates");

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        const duplicate = request.aiDuplicates.find(
            (item) =>
                item.requestId &&
                item.requestId.toString() === duplicateRequestId
        );

        if (!duplicate) {
            return res.status(404).json({
                message: "Duplicate suggestion not found"
            });
        }

        duplicate.decision = decision;
        duplicate.reviewedBy = req.user.id;
        duplicate.reviewedAt = new Date();

        await request.save();

        res.status(200).json({
            message:
                decision === "confirmed"
                    ? "Duplicate confirmed successfully"
                    : "Duplicate rejected successfully",

            request
        });

    } catch (error) {
        console.error("Review duplicate error:", error);

        res.status(500).json({
            message: "Failed to review duplicate",
            error: error.message
        });
    }
};


module.exports = {
    getAIReview,
    reviewAISuggestion,
    reviewDuplicate
};
