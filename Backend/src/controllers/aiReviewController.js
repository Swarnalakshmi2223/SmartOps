const mongoose = require("mongoose");

const Request = require("../models/Request");
const Category = require("../models/Category");
const Department = require("../models/Department");

const allowedPriorities = ["Low", "Medium", "High", "Critical"];

const getFinalReviewValues = ({ request, action, category, department, priority }) => {
    if (action === "modified") {
        if (!category || !department || !priority) {
            return {
                error: "Category, department and priority are required when modifying"
            };
        }

        return { category, department, priority };
    }

    return {
        category: request.aiCategory || request.category,
        department: request.aiDepartment || request.department,
        priority: request.aiPriority || request.priority
    };
};

const validateReviewValues = async ({ category, department, priority }) => {
    if (!allowedPriorities.includes(priority)) {
        return "Invalid priority";
    }

    const categoryExists = await Category.findOne({
        name: category,
        isActive: { $ne: false }
    });

    if (!categoryExists) {
        return "Selected category is not active";
    }

    const departmentExists = await Department.findOne({
        name: department,
        isActive: { $ne: false }
    });

    if (!departmentExists) {
        return "Selected department is not active";
    }

    return null;
};


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

        const finalValues = getFinalReviewValues({
            request,
            action,
            category,
            department,
            priority
        });

        if (finalValues.error) {
            return res.status(400).json({
                message: finalValues.error
            });
        }

        const validationError = await validateReviewValues(finalValues);
        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        request.category = finalValues.category;
        request.department = finalValues.department;
        request.priority = finalValues.priority;

        request.aiReviewed = true;
        request.aiReviewedBy = req.user.id;
        request.aiReviewAction = action === "accept" ? "accepted" : "modified";
        request.aiReviewedAt = new Date();

        await request.save();

        res.status(200).json({
            message: action === "accept"
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
