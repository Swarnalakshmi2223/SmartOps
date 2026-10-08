const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const reportRoutes = require("./routes/reportRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const aiRoutes = require("./routes/aiRoutes");
const aiReviewRoutes = require("./routes/aiReviewRoutes");
const { initializeSocket } = require("./socket/socketServer");

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
}

const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5173";

const app = express();
const httpServer = http.createServer(app);

initializeSocket(httpServer, frontendOrigin);

connectDB();


app.use(cors({
    origin: frontendOrigin,
    credentials: true
}));
app.use(helmet());
app.use(express.json());

// Controllers keep detailed errors in server logs, but never return them to clients.
app.use((req, res, next) => {
    const sendJson = res.json.bind(res);
    res.json = (payload) => {
        if (payload && typeof payload === "object" && payload.error) {
            const safePayload = { ...payload };
            delete safePayload.error;
            return sendJson(safePayload);
        }

        return sendJson(payload);
    };
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai-review", aiReviewRoutes);


app.get("/", (req,res) => {
    res.json({
        message: "SmartOps backend is running successfully"
    });
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error("Unhandled request error:", err);

    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid resource identifier" });
    }

    return res.status(err.statusCode || 500).json({
        message: "An unexpected server error occurred"
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`SmartOps server running on port ${PORT}`);
});
