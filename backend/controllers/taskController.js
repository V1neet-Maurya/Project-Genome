import Task from "../models/Task.js";
import Project from "../models/Project.js";

import { hasProjectAccess } from "../utils/projectPermission.js";

import {
  createActivity,
  createNotification,
} from "../utils/notificationHelper.js";

// =====================================================
// CREATE TASK
// Owner + Admin + Developer
// =====================================================

export async function createTask(req, res, next) {
  try {
    const {
      title,
      description,
      project: projectId,
      assignedTo,
      status,
      priority,
      labels,
      dueDate,
    } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title and project are required",
      });
    }

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check project access
    const permission = hasProjectAccess(
      project,
      req.user._id
    );

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    // Check task creation permission
    if (
      !["owner", "admin", "developer"].includes(
        permission.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to create tasks",
      });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      status,
      priority,
      labels,
      dueDate,
    });

    // Get Socket.IO instance
    const io = req.app.get("io");

    // Create activity
    await createActivity({
      user: req.user._id,
      project: task.project,
      action: "created",
      entityType: "task",
      entityId: task._id,
      message: `Created task "${task.title}"`,
    });

    // Create notification
    await createNotification({
      user: req.user._id,
      project: task.project,
      type: "task",
      title: "Task Created",
      message: `You created "${task.title}"`,
      entityId: task._id,
      io,
    });

    const populatedTask = await Task.findById(
      task._id
    )
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
      message: "Task created successfully",
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// GET ALL TASKS
// =====================================================

export async function getTasks(req, res, next) {
  try {
    const {
      project,
      status,
      priority,
    } = req.query;

    // Find projects where user is:
    // owner OR member
    const userProjects = await Project.find({
      $or: [
        {
          owner: req.user._id,
        },
        {
          "members.user": req.user._id,
        },
      ],
    }).select("_id");

    const projectIds = userProjects.map(
      (item) => item._id
    );

    const filter = {
      project: {
        $in: projectIds,
      },
    };

    // If a specific project is requested,
    // make sure it belongs to user's accessible projects
    if (project) {
      const hasAccessToProject =
        projectIds.some(
          (projectId) =>
            projectId.toString() ===
            project.toString()
        );

      if (!hasAccessToProject) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this project",
        });
      }

      filter.project = project;
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    const tasks = await Task.find(filter)
      .populate("project", "name")
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

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// GET SINGLE TASK
// =====================================================
export async function getTask(req, res, next) {
  try {
    // Find task and populate its complete project
    const task = await Task.findById(
      req.params.id
    ).populate("project");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check project membership/permission
    const permission = hasProjectAccess(
      task.project,
      req.user._id
    );

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this task",
      });
    }

    // User has access through the project
    const populatedTask = await Task.findById(
      task._id
    )
      .populate("project", "name")
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
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// UPDATE TASK
// =====================================================
export async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(
      req.params.id
    ).populate(
      "project",
      "name owner members"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const permission = hasProjectAccess(
      task.project,
      req.user._id
    );

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this task",
      });
    }

    // Owner + Admin + Developer can update
    if (
      !["owner", "admin", "developer"].includes(
        permission.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to update this task",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "assignedTo",
      "status",
      "priority",
      "labels",
      "dueDate",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    const updatedTask = await Task.findById(
      task._id
    )
      .populate("project", "name")
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
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// DELETE TASK
// =====================================================

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(
      req.params.id
    ).populate(
      "project",
      "name owner members"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const permission = hasProjectAccess(
      task.project,
      req.user._id
    );

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this task",
      });
    }

    // Only Owner + Admin can delete
    if (
      !["owner", "admin"].includes(
        permission.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to delete this task",
      });
    }

    await Task.findByIdAndDelete(task._id);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}