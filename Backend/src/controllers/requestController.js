const Request = require("../models/Request");
const User = require("../models/User");

const createRequest = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;

        if (!title || !description || !category ){
            return res.status(400).json({
                message: "Title, Description, and category are required"
            });
        }

        const newRequest = new Request({
            title,
            description,
            category,
            priority: priority || "Medium",
            createdBy: req.user.id
        });

        await newRequest.save();

        res.status(201).json({
            message: "Request created Successfully",
            request: newRequest
       });
       
    } catch (error) {
        res.status(500).json({
            message: "Failed to create request",
            error: error.message
        });
    }
};


const getMyRequests = async (req, res) => {
    try{
        const requests = await Request.find({
            createdBy: req.user.id
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            message: "Request fetched successfully",
            count: requests.length,
            requests
        });

    }catch (error) {
        res.status(500).json({
            message: "Failed to fetch requests",
            error: error.message
        });
    }
};


const getRequestById = async (req, res) => {
    try {
           const { id } = req.params;

           const request = await Request.findById(id);

           if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
           }

           if(request.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You do not have permission to view this request"
            });
           }

           res.status(200).json({
            message: "Request fetched successfully",
            request
           });
    
        } catch (error) {
            res.status(500).json({
                message: "Failed to fetch request",
                error: error.message
            });
        } 
};




const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, priority } = req.body;

        const request = await Request.findById(id);

        if(!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (request.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You do not have permission to update this request"
            });
        }

        if (title) {
            request.title = title;
        }

        if(description) {
            request.description = description;
        }

        if (category) {
            request.category = category;
        }

        if (priority) {
            request.priority = priority;
        }

        await request.save();

        res.status(200).json({
            message: "request updated successfully",
            request
        });

    }catch (error) {
        res.status(500).json({
            message: "Failed to update request",
            error: error.message
        });
    }
};


const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Assigned",
            "In Progress",
            "Resolved",
            "Rejected"
        ];

        // Validate status
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        // USER can update only their own request
        if (req.user.role === "user") {

            if (request.createdBy.toString() !== req.user.id) {
                return res.status(403).json({
                    message: "You do not have permission to update this request"
                });
            }

        }

        // STAFF can update only requests assigned to them
        if (req.user.role === "staff") {

            if (
                !request.assignedTo ||
                request.assignedTo.toString() !== req.user.id
            ) {
                return res.status(403).json({
                    message: "You are not assigned to this request"
                });
            }

        }

        // ADMIN can update any request

        request.status = status;

        await request.save();

        res.status(200).json({
            message: "Request status updated successfully",
            request
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update request status",
            error: error.message
        });
    }
};

const getAllRequests = async (req, res) =>{
    try {
        const requests = await Request.find()
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role")
        .sort({ createdAt: -1 
        });

        res.status(200).json({
            message: "Requests fectched successfully",
            count : requests.length,
            requests
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch requests",
            error: error.message
        });
    }
};



const assignRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { staffId } = req.body;

        if (!staffId) {
            return res.status(400).json({
                message: "Staff ID is required"
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        const staff = await User.findById(staffId);

        if (!staff) {
            return res.status(404).json({
                message: "Staff member not found"
            });
        }

        if (staff.role !== "staff") {
            return res.status(400).json({
                message: "Selected user is not a staff member"
            });
        }

        if (!staff.isActive) {
            return res.status(400).json({
                message: "Cannot assign request to an inactive staff member"
            });
        }

        request.assignedTo = staff._id;
        request.status = "Assigned";

        await request.save();

        res.status(200).json({
            message: "Request assigned successfully",
            request
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to assign request",
            error: error.message
        });
    }
};


const getAssignedRequests = async (req, res) => {
    try {
        const requests = await Request.find({
            assignedTo: req.user.id
            })
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .sort({ 
                createdAt: -1 
        });

        res.status(200).json({
            message: "Assigned requests fetched successfully",
            count: requests.length,
            requests
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch assigned requests",
            error: error.message
        });
    }
};


module.exports = {
    createRequest,
    getMyRequests,
    getRequestById,
    updateRequest,
    updateRequestStatus,
    getAllRequests,
    assignRequest,
    getAssignedRequests
};