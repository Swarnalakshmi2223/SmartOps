const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
    user,
    action,
    module,
    description,
    request = null
}) => {
    try {
        await AuditLog.create({
            user,
            action,
            module,
            description,
            request
        });
    } catch (error) {
        console.error("Audit log error:", error.message);
    }
};

module.exports = createAuditLog;