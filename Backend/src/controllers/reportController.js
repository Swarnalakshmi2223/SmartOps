const Request = require("../models/Request");

// 1. Get Request Report
const getRequestReport = async (req, res) => {
    try {
        const totalRequests = await Request.countDocuments();

        const pending = await Request.countDocuments({
            status: "Pending"
        });

        const assigned = await Request.countDocuments({
            status: "Assigned"
        });

        const inProgress = await Request.countDocuments({
            status: "In Progress"
        });

        const resolved = await Request.countDocuments({
            status: "Resolved"
        });

        const closed = await Request.countDocuments({
            status: "Closed"
        });

        const low = await Request.countDocuments({
            priority: "Low"
        });

        const medium = await Request.countDocuments({
            priority: "Medium"
        });

        const high = await Request.countDocuments({
            priority: "High"
        });

        const critical = await Request.countDocuments({
            priority: "Critical"
        });

        res.status(200).json({
            message: "Request report generated successfully",

            report: {
                totalRequests,

                statusSummary: {
                    pending,
                    assigned,
                    inProgress,
                    resolved,
                    closed
                },

                prioritySummary: {
                    low,
                    medium,
                    high,
                    critical
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate request report",
            error: error.message
        });
    }
};


// 2. Get Category-wise Report
const getCategoryReport = async (req, res) => {
    try {
        const categoryReport = await Request.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ]);

        res.status(200).json({
            message: "Category report generated successfully",
            categories: categoryReport
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate category report",
            error: error.message
        });
    }
};


// 3. Get Staff Workload Report
const getStaffWorkloadReport = async (req, res) => {
    try {
        const staffWorkload = await Request.aggregate([
            {
                $match: {
                    assignedTo: {
                        $ne: null
                    }
                }
            },
            {
                $group: {
                    _id: "$assignedTo",
                    requestCount: {
                        $sum: 1
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "staff"
                }
            },
            {
                $unwind: "$staff"
            },
            {
                $project: {
                    _id: 0,
                    staffId: "$staff._id",
                    staffName: "$staff.name",
                    staffEmail: "$staff.email",
                    requestCount: 1
                }
            },
            {
                $sort: {
                    requestCount: -1
                }
            }
        ]);

        res.status(200).json({
            message: "Staff workload report generated successfully",
            staffWorkload
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate staff workload report",
            error: error.message
        });
    }
};


// 4. Get Date-based Request Report
const getDateBasedReport = async (req, res) => {
    try {
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({
                message: "Both from and to dates are required"
            });
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date format. Use YYYY-MM-DD"
            });
        }

        toDate.setHours(23, 59, 59, 999);

        if (fromDate > toDate) {
            return res.status(400).json({
                message: "From date cannot be greater than to date"
            });
        }

        const requests = await Request.find({
            createdAt: {
                $gte: fromDate,
                $lte: toDate
            }
        });

        const totalRequests = requests.length;

        const pending = requests.filter(
            request => request.status === "Pending"
        ).length;

        const assigned = requests.filter(
            request => request.status === "Assigned"
        ).length;

        const inProgress = requests.filter(
            request => request.status === "In Progress"
        ).length;

        const resolved = requests.filter(
            request => request.status === "Resolved"
        ).length;

        const closed = requests.filter(
            request => request.status === "Closed"
        ).length;

        const low = requests.filter(
            request => request.priority === "Low"
        ).length;

        const medium = requests.filter(
            request => request.priority === "Medium"
        ).length;

        const high = requests.filter(
            request => request.priority === "High"
        ).length;

        const critical = requests.filter(
            request => request.priority === "Critical"
        ).length;

        res.status(200).json({
            message: "Date-based request report generated successfully",

            dateRange: {
                from,
                to
            },

            report: {
                totalRequests,

                statusSummary: {
                    pending,
                    assigned,
                    inProgress,
                    resolved,
                    closed
                },

                prioritySummary: {
                    low,
                    medium,
                    high,
                    critical
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate date-based report",
            error: error.message
        });
    }
};


module.exports = {
    getRequestReport,
    getCategoryReport,
    getStaffWorkloadReport,
    getDateBasedReport
};
