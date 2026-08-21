import CodeAnalysis from "../models/CodeAnalysis.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Issue from "../models/Issue.js";

// =====================================================
// CREATE TASK FROM AI RECOMMENDATION
// =====================================================

export const createTaskFromAI = async (
  req,
  res,
  next
) => {
  try {
    const {
      analysisId,
      recommendationIndex,
    } = req.body;

    if (!analysisId) {
      return res.status(400).json({
        success: false,
        message: "Analysis ID is required",
      });
    }

    if (
      recommendationIndex === undefined ||
      recommendationIndex === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Recommendation index is required",
      });
    }

    const analysis =
      await CodeAnalysis.findOne({
        _id: analysisId,
        analyzedBy: req.user._id,
      });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Code analysis not found",
      });
    }

    const project =
      await Project.findOne({
        _id: analysis.project,
        owner: req.user._id,
      });

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    const recommendation =
      analysis.aiReview?.recommendations?.[
        Number(recommendationIndex)
      ];

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message:
          "AI recommendation not found",
      });
    }

    const task =
      await Task.create({
        title: recommendation.title,

        description:
          `${recommendation.reason}\n\nRecommended action:\n${recommendation.action}`,

        project: analysis.project,

        status: "todo",

        priority:
          recommendation.priority || "medium",

        createdBy: req.user._id,

        source: "ai",

        aiAnalysis: analysis._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Task created from AI recommendation",

      data: {
        task,
        recommendation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CREATE ISSUE FROM CODELAB FINDING
// =====================================================

export const createIssueFromAI = async (
  req,
  res,
  next
) => {
  try {
    const {
      analysisId,
      findingIndex,
    } = req.body;

    if (!analysisId) {
      return res.status(400).json({
        success: false,
        message: "Analysis ID is required",
      });
    }

    if (
      findingIndex === undefined ||
      findingIndex === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Finding index is required",
      });
    }

    // ==========================================
    // FIND ANALYSIS BELONGING TO USER
    // ==========================================

    const analysis =
      await CodeAnalysis.findOne({
        _id: analysisId,
        analyzedBy: req.user._id,
      });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Code analysis not found",
      });
    }

    // ==========================================
    // CHECK PROJECT ACCESS
    // ==========================================

    const project =
      await Project.findOne({
        _id: analysis.project,
        owner: req.user._id,
      });

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    // ==========================================
    // GET CODELAB FINDING
    // ==========================================

    const finding =
      analysis.findings?.[
        Number(findingIndex)
      ];

    if (!finding) {
      return res.status(404).json({
        success: false,
        message: "Finding not found",
      });
    }

    // ==========================================
    // MAP FINDING SEVERITY TO ISSUE PRIORITY
    // ==========================================

    let priority = "low";

    if (finding.severity === "critical") {
      priority = "critical";
    } else if (finding.severity === "high") {
      priority = "high";
    } else if (finding.severity === "medium") {
      priority = "medium";
    } else {
      priority = "low";
    }

    // ==========================================
    // PREVENT DUPLICATE AI ISSUE
    // ==========================================

    const existingIssue =
      await Issue.findOne({
        project: analysis.project,
        source: "ai",
        aiAnalysis: analysis._id,
        aiFindingIndex: Number(
          findingIndex
        ),
      });

    if (existingIssue) {
      return res.status(200).json({
        success: true,
        message:
          "Issue already created from this CodeLab finding",
        data: {
          issue: existingIssue,
          finding,
          alreadyExists: true,
        },
      });
    }

    // ==========================================
    // CREATE GENOME ISSUE
    // ==========================================

    const issue =
      await Issue.create({
        title: finding.title,

        description:
          `${finding.description || ""}\n\nSuggestion:\n${
            finding.suggestion ||
            "Review this CodeLab finding."
          }`,

        project: analysis.project,

        priority,

        status: "open",

        createdBy: req.user._id,

        source: "ai",

        aiAnalysis: analysis._id,

        aiFindingIndex:
          Number(findingIndex),
      });

    return res.status(201).json({
      success: true,

      message:
        "Issue created from CodeLab finding",

      data: {
        issue,
        finding,
        alreadyExists: false,
      },
    });
  } catch (error) {
    next(error);
  }
};