const Request = require("../models/Request");
const User = require("../models/User");
const mongoose = require("mongoose");
const fs = require("node:fs");
const path = require("node:path");
const createAuditLog = require("../utils/auditLogger");
const {
    analyzeRequest,
    findDuplicateRequests
} = require("../ai/aiService");

const {
    createAutomaticNotification,
    notifyActiveAdministrators
} = require("../services/notificationService");
const { sendEmail } = require("../services/emailService");
const { isValidEmail } = require("../utils/validation");
const {
    emitRequestEvent
} = require("../socket/socketServer");

const confirmationEmailFailureMessage =
    "Your request was created successfully, but the confirmation email could not be sent.";

const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const toPublicRequest = (request) => {
    const publicRequest = request.toObject();
    delete publicRequest.aiDuplicates;
    delete publicRequest.creationKey;
    delete publicRequest.confirmationEmailSent;
    delete publicRequest.confirmationEmailMessageId;
    delete publicRequest.confirmationEmailAttemptedAt;
    return publicRequest;
};

const findExistingRequest = async (creationKey, userId) => {
    if (!creationKey || creationKey.length > 200) {
        return null;
    }

    const existingRequest = await Request.findOne({ creationKey })
        .select(
            "+creationKey +confirmationEmailSent +confirmationEmailMessageId"
        );

    if (!existingRequest) {
        return null;
    }

    if (existingRequest.createdBy.toString() !== userId) {
        return { conflict: true };
    }

    return { request: existingRequest };
};

const buildRequest = ({ req, title, description, category, priority, department, location, creationKey }) => (
    new Request({
        title,
        description,
        category,
        priority: priority || "Medium",
        department: department || null,
        location: location || null,
        attachment: req.file ? req.file.filename : null,
        attachmentOriginalName: req.file ? req.file.originalname : null,
        attachmentMimeType: req.file ? req.file.mimetype : null,
        attachmentSize: req.file ? req.file.size : null,
        createdBy: req.user.id,
        ...(creationKey && creationKey.length <= 200
            ? { creationKey }
            : {}),
        statusHistory: [
            {
                status: "Pending",
                changedBy: req.user.id,
                changedAt: new Date(),
                comment: "Request created"
            }
        ]
    })
);

const applyAiAnalysis = async (request, title, description) => {
    try {
        const analysis = analyzeRequest({ title, description });

        request.aiCategory = analysis.category;
        request.aiDepartment = analysis.department;
        request.aiPriority = analysis.priority;
        request.aiCategoryScore = analysis.categoryScore;
        request.aiDepartmentScore = analysis.departmentScore;
        request.aiPriorityScore = analysis.priorityScore;
        request.aiAnalyzedAt = new Date();

        const existingRequests = await Request.find()
            .select("title description")
            .sort({ createdAt: -1 })
            .limit(500)
            .lean();

        const duplicates = await findDuplicateRequests(
            { title, description },
            existingRequests
        );

        request.aiDuplicates = duplicates
            .slice(0, 5)
            .map((item) => ({
                requestId: item.requestId,
                title: item.title,
                similarity: item.similarity
            }));
    } catch (aiError) {
        console.error("AI analysis skipped:", aiError.message);
    }
};

const findRequestCreator = async (userId) => {
    try {
        return await User.findById(userId)
            .select("name email")
            .lean();
    } catch (creatorError) {
        console.error("Request creator lookup failed:", creatorError.message);
        return null;
    }
};

const sendCreationEmail = async (request, requestCreator) => {
    let emailSent = false;
    let emailMessage = confirmationEmailFailureMessage;

    try {
        const recipientEmail = requestCreator?.email?.trim();
        const hasValidRecipientEmail = isValidEmail(recipientEmail);

        console.log("Request creation email event:", {
            requestId: request._id.toString(),
            recipientEmailPresent: Boolean(recipientEmail),
            recipientEmailValid: hasValidRecipientEmail
        });

        if (!hasValidRecipientEmail) {
            console.warn("Request creation email skipped: creator email is unavailable or invalid", {
                requestId: request._id.toString()
            });
        } else {
            const requestUrl = `${process.env.FRONTEND_ORIGIN || "http://localhost:5173"}/user/requests/${request._id}`;
            const requestNumber = request.requestNumber || request._id;
            const emailResult = await sendEmail({
                to: recipientEmail,
                subject: `SmartOps request created: ${request.title}`,
                text: `Your SmartOps service request has been created successfully.\n\nRequest number: ${requestNumber}\nTitle: ${request.title}\nCategory: ${request.category}\nPriority: ${request.priority}\nCurrent status: ${request.status}\n\nTrack your request in SmartOps: ${requestUrl}`,
                html: `
                        <h2>SmartOps request created</h2>
                        <p>Your service request has been created successfully.</p>
                        <p><strong>Request number:</strong> ${escapeHtml(requestNumber)}</p>
                        <p><strong>Title:</strong> ${escapeHtml(request.title)}</p>
                        <p><strong>Category:</strong> ${escapeHtml(request.category)}</p>
                        <p><strong>Priority:</strong> ${escapeHtml(request.priority)}</p>
                        <p><strong>Current status:</strong> ${escapeHtml(request.status)}</p>
                        <p><a href="${escapeHtml(requestUrl)}">Track this request in SmartOps</a></p>
                    `
            });

            emailSent = Boolean(emailResult.success);
            emailMessage = emailSent
                ? "Your request was created successfully, and the confirmation email was sent."
                : confirmationEmailFailureMessage;
            request.confirmationEmailMessageId = emailResult.messageId || null;

            console.log("Request creation email result:", {
                requestId: request._id.toString(),
                success: emailResult.success
            });
        }
    } catch (emailError) {
        console.error("Request creation email flow failed:", {
            requestId: request._id.toString(),
            message: emailError.message
        });
    }

    return { emailSent, emailMessage };
};

const saveRequestWithUniqueNumber = async (request) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
            await request.save();
            return;
        } catch (error) {
            const duplicateRequestNumber = error?.code === 11000 &&
                error?.keyPattern?.requestNumber;

            if (!duplicateRequestNumber || attempt === 2) {
                throw error;
            }

            request.requestNumber = undefined;
        }
    }
};

const createRequest = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            priority,
            department,
            location
        } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Title, Description, and category are required"
            });
        }

        const creationKey = String(
            req.headers["x-idempotency-key"] || ""
        ).trim();

        const existingResult = await findExistingRequest(
            creationKey,
            req.user.id
        );

        if (existingResult?.conflict) {
            return res.status(409).json({
                message: "This request submission key has already been used"
            });
        }

        if (existingResult?.request) {
            const existingRequest = existingResult.request;
            return res.status(200).json({
                message: existingRequest.confirmationEmailSent
                    ? "Your request was created successfully, and the confirmation email was sent."
                    : confirmationEmailFailureMessage,
                emailSent: existingRequest.confirmationEmailSent,
                duplicateSubmission: true,
                request: toPublicRequest(existingRequest)
            });
        }

        const newRequest = buildRequest({
            req,
            title,
            description,
            category,
            priority,
            department,
            location,
            creationKey
        });

        // AI assistance: must never stop the request from being saved
        await applyAiAnalysis(newRequest, title, description);

        await saveRequestWithUniqueNumber(newRequest);

        const requestCreator = await findRequestCreator(req.user.id);

        await notifyActiveAdministrators({
            request: newRequest,
            event: "created",
            title: "New Request Created",
            requesterName: requestCreator?.name
        });

        // Send the request-creation email only after the request is safely stored.
        // Email delivery must not turn a successful request creation into a failure.
        const { emailSent, emailMessage } = await sendCreationEmail(
            newRequest,
            requestCreator
        );

        newRequest.confirmationEmailSent = emailSent;
        newRequest.confirmationEmailAttemptedAt = new Date();
        await newRequest.save();

        emitRequestEvent("request.created", newRequest);

        // Audit log
        await createAuditLog({
            user: req.user.id,
            action: "CREATE_REQUEST",
            module: "Request Management",
            description: "User created a new service request",
            request: newRequest._id
        });

        // Do not expose AI duplicate details in normal response
        const responseRequest = toPublicRequest(newRequest);

        return res.status(201).json({
            message: emailMessage,
            emailSent,
            request: responseRequest
        });

    } catch (error) {
        console.error("Create request error:", error);

        return res.status(500).json({
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

           if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "Invalid request ID"
                });
           }

           const request = await Request.findById(id)
               .populate("createdBy", "name email role")
               .populate("assignedTo", "name email role")
               .populate("statusHistory.changedBy", "name email role")
               .populate("comments.user", "name email role");

           if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
           }

           const isAdmin = req.user.role === "admin";
           const isRequester = request.createdBy?._id?.toString() === req.user.id;
           const isAssignedStaff = request.assignedTo?._id?.toString() === req.user.id;

           if (!isAdmin && !isRequester && !isAssignedStaff) {
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




const requestUploadDirectory = path.resolve(
    __dirname,
    "../../uploads"
);

const isValidStoredFilename = (filename) => {
    return (
        typeof filename === "string" &&
        path.basename(filename) === filename &&
        /^[a-z0-9_-]+\.(jpg|jpeg|png|webp|pdf|doc|docx)$/i.test(
            filename
        )
    );
};

const canAccessRequestFile = (request, user) => {
    const isAdmin = user.role === "admin";
    const isRequester = request.createdBy?.toString() === user.id;
    const isAssignedStaff = request.assignedTo?.toString() === user.id;

    return isAdmin || isRequester || isAssignedStaff;
};

const sendRequestFile = async (req, res, fieldName, fileLabel) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid request ID"
            });
        }

        const request = await Request.findById(req.params.id).select(
            `createdBy assignedTo ${fieldName}`
        );

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (!canAccessRequestFile(request, req.user)) {
            return res.status(403).json({
                message: `You do not have permission to view this ${fileLabel}`
            });
        }

        const filename = request[fieldName];

        if (!filename) {
            return res.status(404).json({
                message: `${fileLabel} not found`
            });
        }

        if (!isValidStoredFilename(filename)) {
            return res.status(404).json({
                message: `Invalid ${fileLabel} reference`
            });
        }

        const filePath = path.resolve(
            requestUploadDirectory,
            filename
        );

        if (
            !filePath.startsWith(
                `${requestUploadDirectory}${path.sep}`
            ) ||
            !fs.existsSync(filePath)
        ) {
            return res.status(404).json({
                message: `${fileLabel} not found`
            });
        }

        return res.sendFile(filePath);
    } catch (error) {
        return res.status(500).json({
            message: `Failed to fetch ${fileLabel}`,
            error: error.message
        });
    }
};

const getRequestAttachment = async (req, res) => {
    return sendRequestFile(
        req,
        res,
        "attachment",
        "attachment"
    );
};

const getResolutionEvidence = async (req, res) => {
    return sendRequestFile(
        req,
        res,
        "resolutionEvidence",
        "resolution evidence"
    );
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

const validStatusTransitions = {
    Pending: ["Assigned"],
    Assigned: ["In Progress"],
    "In Progress": ["Resolved"],
    Resolved: ["Closed"],
    Closed: []
};

const getStatusPermissionError = (request, user, status) => {
    if (user.role === "user") {
        if (request.createdBy.toString() !== user.id) {
            return "You do not have permission to update this request";
        }

        if (status !== "Closed") {
            return "Users can only close their own resolved requests";
        }
    }

    if (user.role === "staff") {
        const isAssignedToUser = request.assignedTo &&
            request.assignedTo.toString() === user.id;

        if (!isAssignedToUser) {
            return "You are not assigned to this request";
        }

        if (!["In Progress", "Resolved"].includes(status)) {
            return "Staff can only start or resolve assigned requests";
        }
    }

    if (status === "Closed" && user.role !== "user") {
        return "Only the request owner can close a request";
    }

    return null;
};

const appendStatusHistory = (request, status, userId) => {
    const oldStatus = request.status;
    request.status = status;
    request.statusHistory = request.statusHistory || [];
    request.statusHistory.push({
        status,
        changedBy: userId,
        changedAt: new Date(),
        comment: `Request status changed from ${oldStatus} to ${status}`
    });
    return oldStatus;
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
            "Closed"
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

        if (!validStatusTransitions[request.status]?.includes(status)) {
            return res.status(400).json({
                message: `Invalid status transition from ${request.status} to ${status}`
            });
        }

        const permissionError = getStatusPermissionError(
            request,
            req.user,
            status
        );

        if (permissionError) {
            return res.status(403).json({
                message: permissionError
            });
        }

        const oldStatus = appendStatusHistory(request, status, req.user.id);

        await request.save();

        emitRequestEvent("request.statusChanged", request, {
            previousStatus: oldStatus,
            status
        });

               
        await createAuditLog({
            user: req.user.id,
            action: "UPDATE_STATUS",
            module: "Request Management",
            description: `Request status changed from ${oldStatus} to ${status}`,
            request: request._id
          });

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
            message: "Requests fetched successfully",
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
                message: "staffId is required"
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        const staff = await User.findOne({
            _id: staffId,
            role: "staff",
            // Older users may not have the field persisted because the schema
            // default was added later; only an explicit false is inactive.
            isActive: { $ne: false }
        });

        if (!staff) {
            return res.status(404).json({
                message: "Active staff member not found"
            });
        }

        request.assignedTo = staffId;
        request.status = "Assigned";

        // Add status history
        if (!request.statusHistory) {
            request.statusHistory = [];
        }

        request.statusHistory.push({
            status: "Assigned",
            changedBy: req.user.id,
            changedAt: new Date(),
            comment: `Request assigned to ${staff.name}`
        });

        await request.save();

        emitRequestEvent("request.assigned", request, {
            staffId
        });

        await createAutomaticNotification({
            userId: staffId,
            title: "New Request Assigned",
            message: `A new request "${request.title}" has been assigned to you.`,
            type: "assignment",
            relatedRequest: request._id
        });

        return res.status(200).json({
            message: "Request assigned successfully",
            request
        });

    } catch (error) {
        console.error("Assign request error:", error);

        return res.status(500).json({
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

const startRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (
            !request.assignedTo ||
            request.assignedTo.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "This request is not assigned to you"
            });
        }

        if (request.status !== "Assigned") {
            return res.status(400).json({
                message: "Only assigned requests can be started"
            });
        }

        request.status = "In Progress";

        // Add status history
        if (!request.statusHistory) {
            request.statusHistory = [];
        }

        request.statusHistory.push({
            status: "In Progress",
            changedBy: req.user.id,
            changedAt: new Date(),
            comment: "Staff started working on the request"
        });

        await request.save();

        emitRequestEvent("request.started", request, {
            previousStatus: "Assigned",
            status: "In Progress"
        });
        emitRequestEvent("request.statusChanged", request, {
            previousStatus: "Assigned",
            status: "In Progress"
        });

        await createAutomaticNotification({
            userId: request.createdBy,
            title: "Request In Progress",
            message: `Your request "${request.title}" is now being handled by the support team.`,
            type: "status",
            relatedRequest: request._id
        });

        return res.status(200).json({
            message: "Request started successfully",
            request
        });

    } catch (error) {
        console.error("Start request error:", error);

        return res.status(500).json({
            message: "Failed to start request",
            error: error.message
        });
    }
};

const resolveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution } = req.body;

        if (!resolution?.trim()) {
            return res.status(400).json({
                message: "Resolution is required"
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (
            !request.assignedTo ||
            request.assignedTo.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "This request is not assigned to you"
            });
        }

        if (request.status !== "In Progress") {
            return res.status(400).json({
                message: "Only In Progress requests can be resolved"
            });
        }

        request.resolution = resolution.trim();
        request.status = "Resolved";

        // Add status history
        if (!request.statusHistory) {
            request.statusHistory = [];
        }

        request.statusHistory.push({
            status: "Resolved",
            changedBy: req.user.id,
            changedAt: new Date(),
            comment: "Staff resolved the request"
        });

        await request.save();

        emitRequestEvent("request.resolved", request, {
            previousStatus: "In Progress",
            status: "Resolved"
        });
        emitRequestEvent("request.statusChanged", request, {
            previousStatus: "In Progress",
            status: "Resolved"
        });

        // Notify the user who created the request
        await createAutomaticNotification({
            userId: request.createdBy,
            title: "Request Resolved",
            message: `Your request "${request.title}" has been resolved by the support team.`,
            type: "status",
            relatedRequest: request._id
        });

        return res.status(200).json({
            message: "Request resolved successfully",
            request
        });

    } catch (error) {
        console.error("Resolve request error:", error);

        return res.status(500).json({
            message: "Failed to resolve request",
            error: error.message
        });
    }
};

const closeRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        // Only the user who created the request can close it
        if (request.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only close your own request"
            });
        }

        // Only resolved requests can be closed
        if (request.status !== "Resolved") {
            return res.status(400).json({
                message: "Only resolved requests can be closed"
            });
        }

        request.status = "Closed";

        // Add status history
        if (!request.statusHistory) {
            request.statusHistory = [];
        }

        request.statusHistory.push({
            status: "Closed",
            changedBy: req.user.id,
            changedAt: new Date(),
            comment: "Request closed by requester"
        });

        await request.save();

        emitRequestEvent("request.closed", request, {
            previousStatus: "Resolved",
            status: "Closed"
        });
        emitRequestEvent("request.statusChanged", request, {
            previousStatus: "Resolved",
            status: "Closed"
        });

        // Notify assigned staff
        if (request.assignedTo) {
            await createAutomaticNotification({
                userId: request.assignedTo,
                title: "Request Closed",
                message: `The request "${request.title}" has been closed by the user.`,
                type: "status",
                relatedRequest: request._id
            });
        }

        await notifyActiveAdministrators({
            request,
            event: "status-closed",
            title: "Request Closed",
            actorId: req.user.id
        });

        return res.status(200).json({
            message: "Request closed successfully",
            request
        });

    } catch (error) {
        console.error("Close request error:", error);

        return res.status(500).json({
            message: "Failed to close request",
            error: error.message
        });
    }
};

// 11. Search and Filter Requests
const searchRequests = async (req, res) => {
    try {
        const {
            search,
            category,
            priority,
            status,
            assignedTo,
            createdBy
        } = req.query;

        const filter = {};

        // Search by title or description
        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // Filter by category
        if (category) {
            filter.category = {
                $regex: category,
                $options: "i"
            };
        }

        // Filter by priority
        if (priority) {
            filter.priority = priority;
        }

        // Filter by status
        if (status) {
            filter.status = status;
        }

        // Filter by assigned staff
        if (assignedTo) {
            filter.assignedTo = assignedTo;
        }

        // Filter by request creator
        if (createdBy) {
            filter.createdBy = createdBy;
        }

        const requests = await Request.find(filter)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Requests fetched successfully",
            count: requests.length,
            requests
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to search requests",
            error: error.message
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({
                message: "Comment text is required"
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        // Admin can comment on any request
        // Request creator can comment
        // Assigned staff can comment
        const isAdmin = req.user.role === "admin";

        const isRequester =
            request.createdBy &&
            request.createdBy.toString() === req.user.id;

        const isAssignedStaff =
            request.assignedTo &&
            request.assignedTo.toString() === req.user.id;

        if (!isAdmin && !isRequester && !isAssignedStaff) {
            return res.status(403).json({
                message: "You are not allowed to comment on this request"
            });
        }

        const comment = {
            user: req.user.id,
            text: text.trim(),
            createdAt: new Date()
        };

        request.comments.push(comment);

        await request.save();

        const addedComment =
            request.comments[request.comments.length - 1];

        emitRequestEvent("request.commentAdded", request, {
            comment: addedComment
        });

        return res.status(201).json({
            message: "Comment added successfully",
            comment: addedComment
        });

    } catch (error) {
        console.error("Add comment error:", error);

        return res.status(500).json({
            message: "Failed to add comment",
            error: error.message
        });
    }
};


const getComments = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findById(id)
            .select("createdBy assignedTo comments")
            .populate("comments.user", "name email role");

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        // Admin can view comments on any request
        const isAdmin = req.user.role === "admin";

        // Request creator can view comments
        const isRequester =
            request.createdBy &&
            request.createdBy.toString() === req.user.id;

        // Assigned staff can view comments
        const isAssignedStaff =
            request.assignedTo &&
            request.assignedTo.toString() === req.user.id;

        if (!isAdmin && !isRequester && !isAssignedStaff) {
            return res.status(403).json({
                message: "You are not allowed to view these comments"
            });
        }

        return res.status(200).json({
            message: "Comments fetched successfully",
            comments: request.comments
        });

    } catch (error) {
        console.error("Get comments error:", error);

        return res.status(500).json({
            message: "Failed to fetch comments",
            error: error.message
        });
    }
};


module.exports = {
    createRequest,
    getMyRequests,
    getRequestById,
    getRequestAttachment,
    getResolutionEvidence,
    updateRequest,
    updateRequestStatus,
    getAllRequests,
    assignRequest,
    getAssignedRequests,
    startRequest,
    resolveRequest,
    closeRequest,
    searchRequests,
    addComment,
    getComments
};
