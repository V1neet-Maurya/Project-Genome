import Issue from "../models/Issue.js";
import Project from "../models/Project.js";

import {
  createActivity,
  createNotification,
} from "../utils/notificationHelper.js";

// =====================================================
// CREATE ISSUE
// =====================================================

export const createIssue = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
    } = req.body;

    if (!title || !project) {
      return res.status(400).json({
        success: false,
        message:
          "Title and project are required",
      });
    }

    // ---------------------------------------------
    // Check project ownership
    // ---------------------------------------------

    const projectExists =
      await Project.findOne({
        _id: project,
        owner: req.user._id,
      });

    if (!projectExists) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    // ---------------------------------------------
    // Create issue
    // ---------------------------------------------

    const issue = await Issue.create({
      title,
      description,
      project,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      status: status || "open",
      priority: priority || "medium",
      dueDate: dueDate || null,
    });

    // ---------------------------------------------
    // Socket.IO
    // ---------------------------------------------

    const io = req.app.get("io");

    // ---------------------------------------------
    // Activity
    // ---------------------------------------------

    await createActivity({
      user: req.user._id,
      project: issue.project,
      action: "created",
      entityType: "issue",
      entityId: issue._id,
      message:
        `Created issue "${issue.title}"`,
    });

    // ---------------------------------------------
    // Notification
    // ---------------------------------------------

    await createNotification({
      user: req.user._id,
      project: issue.project,
      type: "issue",
      title: "Issue Created",
      message:
        `You created "${issue.title}"`,
      entityId: issue._id,
      io,
    });

    // ---------------------------------------------
    // Populate issue
    // ---------------------------------------------

    const populatedIssue =
      await Issue.findById(issue._id)
        .populate("project", "name")
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .populate(
          "assignedTo",
          "firstName lastName email"
        );

    return res.status(201).json({
      success: true,
      message:
        "Issue created successfully",
      data: populatedIssue,
    });
  } catch (error) {
    console.error(
      "CREATE ISSUE ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET ALL ISSUES
// =====================================================

export const getIssues = async (
  req,
  res,
  next
) => {
  try {
    // ---------------------------------------------
    // Check authentication
    // ---------------------------------------------

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    // ---------------------------------------------
    // Find projects owned by current user
    // ---------------------------------------------

    const userProjects =
      await Project.find({
        owner: req.user._id,
      }).select("_id");

    const projectIds =
      userProjects.map(
        (project) => project._id
      );

    // ---------------------------------------------
    // User has no projects
    // ---------------------------------------------

    if (projectIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // ---------------------------------------------
    // Find issues
    // ---------------------------------------------

    const issues =
      await Issue.find({
        project: {
          $in: projectIds,
        },
      })
        .populate(
          "project",
          "name"
        )
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .populate(
          "assignedTo",
          "firstName lastName email"
        )
        .sort({
          createdAt: -1,
        });

    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    console.error(
      "GET ISSUES ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET SINGLE ISSUE
// =====================================================

export const getIssueById = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const userProjects =
      await Project.find({
        owner: req.user._id,
      }).select("_id");

    const projectIds =
      userProjects.map(
        (project) => project._id
      );

    const issue =
      await Issue.findOne({
        _id: req.params.id,
        project: {
          $in: projectIds,
        },
      })
        .populate(
          "project",
          "name"
        )
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .populate(
          "assignedTo",
          "firstName lastName email"
        );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error(
      "GET ISSUE BY ID ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// UPDATE ISSUE
// =====================================================

export const updateIssue = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const userProjects =
      await Project.find({
        owner: req.user._id,
      }).select("_id");

    const projectIds =
      userProjects.map(
        (project) => project._id
      );

    const issue =
      await Issue.findOne({
        _id: req.params.id,
        project: {
          $in: projectIds,
        },
      });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "assignedTo",
      "status",
      "priority",
      "dueDate",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !== undefined
        ) {
          issue[field] =
            req.body[field];
        }
      }
    );

    await issue.save();

    const updatedIssue =
      await Issue.findById(
        issue._id
      )
        .populate(
          "project",
          "name"
        )
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .populate(
          "assignedTo",
          "firstName lastName email"
        );

    return res.status(200).json({
      success: true,
      message:
        "Issue updated successfully",
      data: updatedIssue,
    });
  } catch (error) {
    console.error(
      "UPDATE ISSUE ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// DELETE ISSUE
// =====================================================

export const deleteIssue = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const userProjects =
      await Project.find({
        owner: req.user._id,
      }).select("_id");

    const projectIds =
      userProjects.map(
        (project) => project._id
      );

    const issue =
      await Issue.findOne({
        _id: req.params.id,
        project: {
          $in: projectIds,
        },
      });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    await Issue.findByIdAndDelete(
      issue._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Issue deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ISSUE ERROR:",
      error
    );

    next(error);
  }
};