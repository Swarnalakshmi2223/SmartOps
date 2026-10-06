const Request = require("../models/Request");

const {
    analyzeRequest,
    findDuplicateRequests
} = require("../ai/aiService");


// Analyze Request using AI
const analyzeRequestController = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }

        const analysis = analyzeRequest({
            title,
            description
        });

        res.status(200).json({
            message: "AI analysis completed successfully",
            analysis
        });

    } catch (error) {
        res.status(500).json({
            message: "AI analysis failed",
            error: error.message
        });
    }
};


// Detect Duplicate Requests
const detectDuplicateRequests = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }

        const existingRequests = await Request.find()
            .select("title description status priority createdBy")
            .lean();

        const duplicates = await findDuplicateRequests(
            { title, description },
            existingRequests
        );

        res.status(200).json({
            message: "Duplicate request detection completed",
            duplicateCount: duplicates.length,
            duplicates
        });

    } catch (error) {
        res.status(500).json({
            message: "Duplicate detection failed",
            error: error.message
        });
    }
};

const analyzeAndStoreAI = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        const analysis = analyzeRequest({
            title: request.title,
            description: request.description
        });

        request.aiCategory = analysis.category;
        request.aiDepartment = analysis.department;
        request.aiPriority = analysis.priority;

        request.aiCategoryScore = analysis.categoryScore;
        request.aiDepartmentScore = analysis.departmentScore;
        request.aiPriorityScore = analysis.priorityScore;

        request.aiAnalyzedAt = new Date();

        await request.save();

        res.status(200).json({
            message: "AI analysis stored successfully",
            requestId: request._id,
            aiAnalysis: {
                category: request.aiCategory,
                department: request.aiDepartment,
                priority: request.aiPriority,
                categoryScore: request.aiCategoryScore,
                departmentScore: request.aiDepartmentScore,
                priorityScore: request.aiPriorityScore,
                analyzedAt: request.aiAnalyzedAt
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to store AI analysis",
            error: error.message
        });
    }
};

const reviewAIAnalysis = async (req, res) => {
    try {
        const { requestId } = req.params;
        const {
            action,
            category,
            priority
        } = req.body;

        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (!request.aiCategory) {
            return res.status(400).json({
                message: "AI analysis has not been performed for this request"
            });
        }

        if (!["accept", "modify"].includes(action)) {
            return res.status(400).json({
                message: "Action must be accept or modify"
            });
        }

        if (action === "accept") {
            request.category = request.aiCategory;
            request.priority = request.aiPriority;
        }

        if (action === "modify") {
            if (!category || !priority) {
                return res.status(400).json({
                    message: "Category and priority are required when modifying AI suggestions"
                });
            }

            request.category = category;
            request.priority = priority;
        }

        await request.save();

       const actionMessage =
    action === "accept"
        ? "AI analysis accepted successfully"
        : "AI analysis modified successfully";

      res.status(200).json({
          message: actionMessage,
          request
      });
    } catch (error) {
        res.status(500).json({
            message: "Failed to review AI analysis",
            error: error.message
        });
    }
};



module.exports = {
    analyzeRequestController,
    detectDuplicateRequests,
    analyzeAndStoreAI,
    reviewAIAnalysis
};