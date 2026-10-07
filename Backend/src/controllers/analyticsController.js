const Request = require("../models/Request");
const User = require("../models/User");

const getDashboardAnalytics = async (req, res) => {
    try {
        // Total requests
        const totalRequests = await Request.countDocuments();

        // Status counts
        const pendingRequests = await Request.countDocuments({
            status: "Pending"
        });

        const assignedRequests = await Request.countDocuments({
            status: "Assigned"
        });

        const inProgressRequests = await Request.countDocuments({
            status: "In Progress"
        });

        const resolvedRequests = await Request.countDocuments({
            status: "Resolved"
        });

        // Priority counts
        const highPriorityRequests = await Request.countDocuments({
            priority: "High"
        });

        const criticalPriorityRequests = await Request.countDocuments({
            priority: "Critical"
        });

        // Users
        const totalUsers = await User.countDocuments();

        const activeUsers = await User.countDocuments({
            isActive: true
        });

        const inactiveUsers = await User.countDocuments({
            isActive: false
        });

        // Staff
        const totalStaff = await User.countDocuments({
            role: "staff"
        });

        // Resolution rate
        let resolutionRate = 0;

        if (totalRequests > 0) {
            resolutionRate =
                ((resolvedRequests / totalRequests) * 100).toFixed(2);
        }

        res.status(200).json({
            message: "Dashboard analytics generated successfully",

            analytics: {
                requests: {
                    total: totalRequests,
                    pending: pendingRequests,
                    assigned: assignedRequests,
                    inProgress: inProgressRequests,
                    resolved: resolvedRequests
                },

                priority: {
                    high: highPriorityRequests,
                    critical: criticalPriorityRequests
                },

                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: inactiveUsers
                },

                staff: {
                    total: totalStaff
                },

                resolutionRate: `${resolutionRate}%`
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate dashboard analytics",
            error: error.message
        });
    }
};


const getCategoryAnalytics = async (req, res) => {
    try {
        const categoryAnalytics = await Request.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalRequests: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    totalRequests: -1
                }
            }
        ]);

        res.status(200).json({
            message: "Category analytics generated successfully",
            categories: categoryAnalytics
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate category analytics",
            error: error.message
        });
    }
};


const getStaffPerformance = async (req, res) => {
    try {
        const staffPerformance = await Request.aggregate([
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

                    totalAssigned: {
                        $sum: 1
                    },

                    resolved: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "Resolved"]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    pending: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "Pending"]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    inProgress: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "In Progress"]
                                },
                                1,
                                0
                            ]
                        }
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
                    totalAssigned: 1,
                    resolved: 1,
                    pending: 1,
                    inProgress: 1
                }
            },
            {
                $sort: {
                    resolved: -1
                }
            }
        ]);

        res.status(200).json({
            message: "Staff performance analytics generated successfully",
            staffPerformance
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate staff performance analytics",
            error: error.message
        });
    }
};


module.exports = {
    getDashboardAnalytics,
    getCategoryAnalytics,
    getStaffPerformance
};