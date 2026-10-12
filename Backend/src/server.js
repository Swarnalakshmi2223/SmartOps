
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("node:http");
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

// 1. Validate JWT secret
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
        "JWT_SECRET must be configured with at least 32 characters"
    );
}

// 2. Create application and HTTP server
const app = express();
const httpServer = http.createServer(app);

app.set("trust proxy", 1);

// 3. Configure CORS for local development
const normalizeOrigin = (origin) => origin.replace(/\/$/, "");

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_ORIGIN,
    process.env.FRONTEND_URL,
]
    .filter(Boolean)
    .map(normalizeOrigin)
    .filter((origin, index, origins) => origins.indexOf(origin) === index);

app.use(
    cors({
        origin: (origin, callback) => {
            if (
                !origin ||
                allowedOrigins.includes(normalizeOrigin(origin))
            ) {
                return callback(null, true);
            }

            console.warn("CORS blocked origin:", origin);
            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Idempotency-Key",
        ],
    })
);

// 4. Initialize Socket.IO
initializeSocket(httpServer, allowedOrigins);

// 5. Security and request parsing
app.use(helmet());
app.use(express.json());

// 6. Connect to MongoDB before handling API requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        return next();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        return res.status(503).json({
            message: "Database unavailable",
        });
    }
});

// 7. Sanitize error fields in JSON responses
app.use((req, res, next) => {
    const sendJson = res.json.bind(res);

    res.json = (payload) => {
        if (
            payload &&
            typeof payload === "object" &&
            payload.error
        ) {
            const safePayload = { ...payload };
            delete safePayload.error;
            return sendJson(safePayload);
        }

        return sendJson(payload);
    };

    next();
});

// 8. API routes
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

// 9. Root endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        message: "SmartOps backend is running successfully",
    });
});

// 10. Global error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error("Unhandled request error:", err.message);

    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid resource identifier",
        });
    }

    if (err.message === "Origin not allowed by CORS") {
        return res.status(403).json({
            message: "Origin not allowed",
        });
    }

    return res.status(err.statusCode || 500).json({
        message: "An unexpected server error occurred",
    });
});

// 11. Start the local server
const PORT = Number.parseInt(process.env.PORT || "5000", 10);
const HOST = "0.0.0.0";

const startServer = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exitCode = 1;
        return;
    }

    httpServer.on("error", (error) => {
        console.error("SmartOps server failed to start:", error.message);
        process.exitCode = 1;
    });

    httpServer.listen(PORT, HOST, () => {
        console.log(`SmartOps server running on port ${PORT}`);
        console.log("Allowed frontend origins:", allowedOrigins);
    });
};

startServer();

module.exports = httpServer;
