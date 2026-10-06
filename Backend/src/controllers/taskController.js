const Task = require("../models/Task");
const Request = require("../models/Request");
const User = require("../models/User");


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

        if (task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({
                message: "This task is not assigned to you"
            });
        }

        if (task.status !== "Pending") {
            return res.status(400).json({
                message: "Only pending tasks can be started"
            });
        }

        task.status = "In Progress";

        await task.save();

        res.status(200).json({
            message: "Task started successfully",
            task
        });

    } catch (error) {
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

        if (task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({
                message: "This task is not assigned to you"
            });
        }

        if (task.status !== "In Progress") {
            return res.status(400).json({
                message: "Only In Progress tasks can be completed"
            });
        }

        task.status = "Completed";
        task.completedAt = new Date();

        await task.save();

        res.status(200).json({
            message: "Task completed successfully",
            task
        });

    } catch (error) {
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