const Feedback = require("../models/Feedback");
const Request = require("../models/Request");


// 1. Submit Feedback
const createFeedback = async (req, res) => {
    try {
        const { requestId, rating, comment } = req.body;

        if (!requestId || !rating) {
            return res.status(400).json({
                message: "requestId and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (request.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only provide feedback for your own request"
            });
        }

        if (request.status !== "Closed") {
            return res.status(400).json({
                message: "Feedback can only be submitted after the request is closed"
            });
        }

        const existingFeedback = await Feedback.findOne({
            requestId
        });

        if (existingFeedback) {
            return res.status(400).json({
                message: "Feedback already submitted for this request"
            });
        }

        const feedback = new Feedback({
            requestId,
            userId: req.user.id,
            rating,
            comment: comment || null
        });

        await feedback.save();

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to submit feedback",
            error: error.message
        });
    }
};


// 2. Get My Feedback
const getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({
            userId: req.user.id
        })
            .populate("requestId", "title status priority")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Feedback fetched successfully",
            count: feedback.length,
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch feedback",
            error: error.message
        });
    }
};


// 3. Get Feedback By Request
const getFeedbackByRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const feedback = await Feedback.findOne({
            requestId
        })
            .populate("userId", "name email")
            .populate("requestId", "title status priority");

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found for this request"
            });
        }

        res.status(200).json({
            message: "Feedback fetched successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch feedback",
            error: error.message
        });
    }
};


// 4. Get All Feedback
const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate("userId", "name email")
            .populate("requestId", "title status priority")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All feedback fetched successfully",
            count: feedback.length,
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch all feedback",
            error: error.message
        });
    }
};


// 5. Update Feedback
const updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const feedback = await Feedback.findOne({
            _id: id,
            userId: req.user.id
        });

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: "Rating must be between 1 and 5"
                });
            }

            feedback.rating = rating;
        }

        if (comment !== undefined) {
            feedback.comment = comment;
        }

        await feedback.save();

        res.status(200).json({
            message: "Feedback updated successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update feedback",
            error: error.message
        });
    }
};


// 6. Delete Feedback
const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findOneAndDelete({
            _id: id,
            userId: req.user.id
        });

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        res.status(200).json({
            message: "Feedback deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete feedback",
            error: error.message
        });
    }
};


module.exports = {
    createFeedback,
    getMyFeedback,
    getFeedbackByRequest,
    getAllFeedback,
    updateFeedback,
    deleteFeedback
};