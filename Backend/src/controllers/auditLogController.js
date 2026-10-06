const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate("user", "name email role")
            .populate("request", "title status priority")
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "Audit logs fetched successfully",
            count: logs.length,
            logs
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch audit logs",
            error: error.message
        });
    }
};

module.exports = {
    getAuditLogs
};