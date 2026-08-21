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
import aiRoutes from "./routes/aiRoutes.js";
import milestoneRoutes from "./routes/milestoneRoutes.js";
import aiActionRoutes from "./routes/aiActionRoutes.js";
import codeAnalysisRoutes from "./routes/codeAnalysisRoutes.js";
import taskGenerationRoutes from "./routes/taskGenerationRoutes.js";

// =====================================================
// AI PROJECT INTELLIGENCE ROUTES
// =====================================================

import deadlinePredictionRoutes from "./routes/deadlinePredictionRoutes.js";
import workloadRoutes from "./routes/workloadRoutes.js";
import projectSummaryRoutes from "./routes/projectSummaryRoutes.js";
import projectPlannerRoutes from "./routes/projectPlannerRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";

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
  "http://localhost:5174",

  "https://project-genome-od2xpkrky-v1neet-mauryas-projects.vercel.app",

  "https://project-genome-three.vercel.app",

  process.env.FRONTEND_URL,
].filter(Boolean);

console.log(
  "Allowed CORS origins:",
  allowedOrigins
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman, curl and server-to-server requests
    // that don't send an Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(
      "CORS blocked origin:",
      origin
    );

    return callback(
      new Error(
        `CORS blocked origin: ${origin}`
      )
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

// =====================================================
// APPLY CORS
// =====================================================

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

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// LOGGER
// =====================================================

app.use(morgan("dev"));

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/v1/health",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Genome API is running",
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
// GENERAL AI ROUTES
// =====================================================

app.use(
  "/api/v1/ai",
  aiRoutes
);

// =====================================================
// MILESTONE ROUTES
// =====================================================

app.use(
  "/api/v1/milestones",
  milestoneRoutes
);

// =====================================================
// CODE ANALYSIS ROUTES
// =====================================================

app.use(
  "/api/v1/code-analysis",
  codeAnalysisRoutes
);

// =====================================================
// AI ACTION ROUTES
// =====================================================

app.use(
  "/api/v1/ai-actions",
  aiActionRoutes
);

// =====================================================
// AI TASK GENERATION ROUTES
// =====================================================

app.use(
  "/api/v1/ai/task-generation",
  taskGenerationRoutes
);

// =====================================================
// DEADLINE PREDICTION ROUTES
// =====================================================

app.use(
  "/api/v1/deadline-prediction",
  deadlinePredictionRoutes
);

// =====================================================
// WORKLOAD ROUTES
// =====================================================

app.use(
  "/api/v1/workload",
  workloadRoutes
);

// =====================================================
// PROJECT SUMMARY ROUTES
// =====================================================

app.use(
  "/api/v1/project-summary",
  projectSummaryRoutes
);

// =====================================================
// AI PROJECT PLANNER ROUTES
// =====================================================

app.use(
  "/api/v1/ai/project-planner",
  projectPlannerRoutes
);

// =====================================================
// AI ASSISTANT ROUTES
// =====================================================

app.use(
  "/api/v1/ai/assistant",
  assistantRoutes
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
    return res.status(200).json({
      success: true,

      jwtSecretLoaded:
        !!process.env.JWT_SECRET,

      jwtSecretLength:
        process.env.JWT_SECRET?.length || 0,
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

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "Cloudinary test error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Cloudinary test failed",

        cloudinaryStatus:
          error?.http_code || null,

        details:
          error?.error || null,
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
            folder: "genome/test",
            resource_type: "image",
          }
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "Cloudinary upload test error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Upload test failed",

        cloudinaryStatus:
          error?.http_code || null,

        details:
          error?.error || null,
      });
    }
  }
);

// =====================================================
// 404 HANDLER
// MUST ALWAYS BE AFTER ALL ROUTES
// =====================================================

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,
      message: "API route not found",
    });
  }
);

// =====================================================
// GLOBAL ERROR HANDLER
// MUST BE LAST
// =====================================================

app.use(errorMiddleware);

// =====================================================
// HTTP SERVER
// =====================================================

const server =
  http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,

    methods: [
      "GET",
      "POST",
    ],

    credentials: true,
  },
});

app.set("io", io);

io.on(
  "connection",
  (socket) => {
    console.log(
      "Socket connected:",
      socket.id
    );

    socket.on(
      "join-user",
      (userId) => {
        if (!userId) {
          return;
        }

        socket.join(
          `user:${userId}`
        );

        console.log(
          `User ${userId} joined room`
        );
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Socket disconnected:",
          socket.id
        );
      }
    );
  }
);

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
      "0.0.0.0",
      () => {
        console.log(
          `Genome API running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server could not connect to MongoDB.",
      error
    );

    process.exit(1);
  }
};

startServer();