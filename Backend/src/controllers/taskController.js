const Task = require("../models/Task");
const Request = require("../models/Request");
const User = require("../models/User");

const {
    createAutomaticNotification
} = require("../services/notificationService");


// 1. Create Task
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            requestId,
            assignedTo,
            dueDate
        } = req.body;

        if (!title || !description || !requestId || !assignedTo) {
            return res.status(400).json({
                message: "Title, description, requestId and assignedTo are required"
            });
        }

        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        const staff = await User.findOne({
            _id: assignedTo,
            role: "staff",
            isActive: true
        });

        if (!staff) {
            return res.status(404).json({
                message: "Active staff member not found"
            });
        }

        const task = new Task({
            title,
            description,
            requestId,
            assignedTo,
            dueDate: dueDate || null
        });

        await task.save();
        
        await createAutomaticNotification({
            userId: assignedTo,
            title: "New Task Assigned",
            message: `A new task "${task.title}" has been assigned to you.`,
            type: "task",
            relatedTask: task._id,
            relatedRequest: task.requestId
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create task",
            error: error.message
        });
    }
};


// 2. Get All Tasks
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("requestId", "title status priority")
            .populate("assignedTo", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Tasks fetched successfully",
            count: tasks.length,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
};


// 3. Get My Tasks
const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            assignedTo: req.user.id
        })
            .populate("requestId", "title description status")
            .populate("assignedTo", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "My tasks fetched successfully",
            count: tasks.length,
            tasks
        });

    } catch (error) {
        console.error("Get my tasks error:", error);

        res.status(500).json({
            message: "Failed to fetch my tasks",
            error: error.message
        });
    }
};


// 4. Get Task By ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id)
            .populate("requestId", "title description status priority")
            .populate("assignedTo", "name email role");

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task fetched successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch task",
            error: error.message
        });
    }
};


// 5. Start Task
const startTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Only the assigned staff can start the task
        if (task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({
                message: "This task is not assigned to you"
            });
        }

        // Only pending tasks can be started
        if (task.status !== "Pending") {
            return res.status(400).json({
                message: "Only pending tasks can be started"
            });
        }

        task.status = "In Progress";

        await task.save();

        // Get admin users
        const admins = await User.find({
            role: "admin",
            isActive: true
        });

        // Notify all active admins
        for (const admin of admins) {
            await createAutomaticNotification({
                userId: admin._id,
                title: "Task Started",
                message: `The task "${task.title}" has been started by the assigned staff member.`,
                type: "task",
                relatedTask: task._id,
                relatedRequest: task.requestId
            });
        }

        res.status(200).json({
            message: "Task started successfully",
            task
        });

    } catch (error) {
        console.error("Start task error:", error);

        res.status(500).json({
            message: "Failed to start task",
            error: error.message
        });
    }
};

// 6. Complete Task
const completeTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Only assigned staff can complete the task
        if (task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({
                message: "This task is not assigned to you"
            });
        }

        // Only In Progress tasks can be completed
        if (task.status !== "In Progress") {
            return res.status(400).json({
                message: "Only In Progress tasks can be completed"
            });
        }

        task.status = "Completed";
        task.completedAt = new Date();

        await task.save();

        console.log("Task completed:", task._id);

        // Find all active admins
        const admins = await User.find({
            role: "admin",
            isActive: true
        });

        console.log("Active admins found:", admins.length);

        for (const admin of admins) {

            console.log("Creating notification for admin:", admin._id);

            const notification = await createAutomaticNotification({
                userId: admin._id,
                title: "Task Completed",
                message: `The task "${task.title}" has been completed by the assigned staff member.`,
                type: "task",
                relatedTask: task._id,
                relatedRequest: task.requestId
            });

            console.log(
                "Notification result:",
                notification ? notification._id : "FAILED"
            );
        }

        res.status(200).json({
            message: "Task completed successfully",
            task
        });

    } catch (error) {
        console.error("Complete task error:", error);

        res.status(500).json({
            message: "Failed to complete task",
            error: error.message
        });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getMyTasks,
    getTaskById,
    startTask,
    completeTask
};