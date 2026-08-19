import "dotenv/config";

import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { Server } from "socket.io";

// =====================================================
// MIDDLEWARE
// =====================================================

import errorMiddleware from "./middleware/errorMiddleware.js";

// =====================================================
// ROUTES
// =====================================================

import analyticsRoutes from "./routes/analyticsRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// =====================================================
// CONFIG
// =====================================================

import connectDB from "./config/db.js";
import cloudinary from "./config/cloudinary.js";

const app = express();

// =====================================================
// SECURITY
// =====================================================

app.use(helmet());

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
    "http://localhost:5173",
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow Postman, curl and server-to-server requests
        // that do not send an Origin header.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error("Not allowed by CORS")
        );
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

    optionsSuccessStatus: 204,
};

// CORS MUST COME BEFORE API RATE LIMITING
app.use(cors(corsOptions));

// =====================================================
// RATE LIMITING
// =====================================================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many requests. Please try again later.",
    },
});

app.use("/api", limiter);

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());

// =====================================================
// LOGGER
// =====================================================

app.use(morgan("dev"));

// =====================================================
// HTTP SERVER
// =====================================================

const server = http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log(
        "Socket connected:",
        socket.id
    );

    socket.on("join-user", (userId) => {
        if (!userId) {
            return;
        }

        socket.join(`user:${userId}`);

        console.log(
            `User ${userId} joined room`
        );
    });

    socket.on("disconnect", () => {
        console.log(
            "Socket disconnected:",
            socket.id
        );
    });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/api/v1/health",
    (req, res) => {
        res.status(200).json({
            success: true,
            message:
                "Genome API is running",
        });
    }
);

// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
    "/api/v1/auth",
    authRoutes
);

// =====================================================
// PROJECT ROUTES
// =====================================================

app.use(
    "/api/v1/projects",
    projectRoutes
);

// =====================================================
// TASK ROUTES
// =====================================================

app.use(
    "/api/v1/tasks",
    taskRoutes
);

// =====================================================
// ISSUE ROUTES
// =====================================================

app.use(
    "/api/v1/issues",
    issueRoutes
);

// =====================================================
// TEAM ROUTES
// =====================================================

app.use(
    "/api/v1/team",
    teamRoutes
);

// =====================================================
// DASHBOARD ROUTES
// =====================================================

app.use(
    "/api/v1/dashboard",
    dashboardRoutes
);

// =====================================================
// DOCUMENT ROUTES
// =====================================================

app.use(
    "/api/v1/documents",
    documentRoutes
);

// =====================================================
// ACTIVITY ROUTES
// =====================================================

app.use(
    "/api/v1/activities",
    activityRoutes
);

// =====================================================
// NOTIFICATION ROUTES
// =====================================================

app.use(
    "/api/v1/notifications",
    notificationRoutes
);

// =====================================================
// SEARCH ROUTES
// =====================================================

app.use(
    "/api/v1/search",
    searchRoutes
);

// =====================================================
// ANALYTICS ROUTES
// =====================================================

app.use(
    "/api/v1/analytics",
    analyticsRoutes
);

// =====================================================
// USER ROUTES
// =====================================================

app.use(
    "/api/v1/user",
    userRoutes
);

// =====================================================
// TEST JWT
// =====================================================

app.get(
    "/api/v1/test-token",
    (req, res) => {
        res.status(200).json({
            success: true,

            jwtSecretLoaded:
                !!process.env.JWT_SECRET,

            jwtSecretLength:
                process.env.JWT_SECRET
                    ?.length || 0,
        });
    }
);

// =====================================================
// TEST CLOUDINARY CONNECTION
// =====================================================

app.get(
    "/api/v1/test-cloudinary",
    async (req, res) => {
        try {
            const result =
                await cloudinary.api.ping();

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error(
                "Cloudinary test error:",
                error
            );

            res.status(500).json({
                success: false,

                message:
                    error?.message ||
                    "Cloudinary test failed",

                cloudinaryStatus:
                    error?.http_code ||
                    null,

                details:
                    error?.error ||
                    null,
            });
        }
    }
);

// =====================================================
// TEST CLOUDINARY UPLOAD
// =====================================================

app.get(
    "/api/v1/test-cloudinary-upload",
    async (req, res) => {
        try {
            const result =
                await cloudinary.uploader.upload(
                    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                    {
                        folder:
                            "genome/test",

                        resource_type:
                            "image",
                    }
                );

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error(
                "Cloudinary upload test error:",
                error
            );

            res.status(500).json({
                success: false,

                message:
                    error?.message ||
                    "Upload test failed",

                cloudinaryStatus:
                    error?.http_code ||
                    null,

                details:
                    error?.error ||
                    null,
            });
        }
    }
);

// =====================================================
// 404 HANDLER
// MUST COME AFTER ALL ROUTES
// =====================================================

app.use(
    (req, res) => {
        return res.status(404).json({
            success: false,
            message:
                "API route not found",
        });
    }
);

// =====================================================
// GLOBAL ERROR HANDLER
// MUST BE LAST
// =====================================================

app.use(errorMiddleware);

// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();

        server.listen(
            PORT,
            () => {
                console.log(
                    `Genome API running on http://localhost:${PORT}`
                );
            }
        );
    } catch (error) {
        console.error(
            "Server could not connect to MongoDB.",
            error
        );
    }
};

startServer();