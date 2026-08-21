import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC ISSUE INFORMATION
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // PROJECT
    // ==========================================

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // ==========================================
    // USERS
    // ==========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "open",
        "in-progress",
        "resolved",
        "closed",
      ],
      default: "open",
    },

    // ==========================================
    // PRIORITY
    // ==========================================

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "critical",
      ],
      default: "medium",
    },

    // ==========================================
    // DUE DATE
    // ==========================================

    dueDate: {
      type: Date,
      default: null,
    },

    // ==========================================
    // AI ISSUE TRACKING
    // ==========================================

    source: {
      type: String,
      enum: [
        "manual",
        "ai",
      ],
      default: "manual",
    },

    aiAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeAnalysis",
      default: null,
    },

    aiFindingIndex: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Issue = mongoose.model(
  "Issue",
  issueSchema
);

export default Issue;