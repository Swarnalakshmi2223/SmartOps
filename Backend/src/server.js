
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

// --------------------------------------------------
// 1. Validate JWT secret
// --------------------------------------------------

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error(
        "JWT_SECRET must be configured with at least 32 characters"
    );
}

// --------------------------------------------------
// 2. Application and HTTP server
// --------------------------------------------------

const app = express();
const httpServer = http.createServer(app);

// --------------------------------------------------
// 3. CORS configuration
// --------------------------------------------------

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://smartops-frontend1.onrender.com",
    process.env.FRONTEND_ORIGIN,
    process.env.FRONTEND_URL,
]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header, such as
            // health checks and server-to-server requests.
            if (!origin) {
                return callback(null, true);
            }

            const normalizedOrigin = origin.replace(/\/$/, "");

            if (allowedOrigins.includes(normalizedOrigin)) {
                return callback(null, true);
            }

            console.warn("CORS blocked origin:", origin);

            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

// --------------------------------------------------
// 4. Security and request parsing middleware
// --------------------------------------------------

app.use(helmet());
app.use(express.json());

// --------------------------------------------------
// 5. MongoDB connection middleware
// --------------------------------------------------

app.use(async (req, res, next) => {
    try {
        await connectDB();
        return next();
    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        return res.status(503).json({
            message: "Database unavailable",
        });
    }
});

// --------------------------------------------------
// 6. Sanitize error fields in JSON responses
// --------------------------------------------------

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

// --------------------------------------------------
// 7. API routes
// --------------------------------------------------

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

// --------------------------------------------------
// 8. Root endpoint
// --------------------------------------------------

app.get("/", (req, res) => {
    res.status(200).json({
        message: "SmartOps backend is running successfully",
    });
});

// --------------------------------------------------
// 9. Global error handler
// --------------------------------------------------

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error("Unhandled request error:", err);

    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid resource identifier",
        });
    }

    if (
        err.message === "Origin not allowed by CORS"
    ) {
        return res.status(403).json({
            message: "Origin not allowed",
        });
    }

    return res.status(err.statusCode || 500).json({
        message: "An unexpected server error occurred",
    });
});

// --------------------------------------------------
// 10. Start server for Render and local development
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    httpServer.listen(PORT, "0.0.0.0", () => {
        console.log(
            `SmartOps server running on port ${PORT}`
        );
        console.log(
            "Allowed frontend origins:",
            allowedOrigins
        );
    });
}

// Export for environments that import the HTTP server.
module.exports = httpServer;
