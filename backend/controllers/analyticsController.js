import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Issue from "../models/Issue.js";

export const getAnalytics = async (req, res, next) => {
  try {
    // Projects accessible to logged-in user
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id },
      ],
    }).select("_id name");

    const projectIds = projects.map(
      (project) => project._id
    );

    // Tasks
    const tasks = await Task.find({
      project: { $in: projectIds },
    }).select("status priority project");

    // Issues
    const issues = await Issue.find({
      project: { $in: projectIds },
    }).select("status priority project");

    // -----------------------------
    // TASK STATISTICS
    // -----------------------------

    const taskStats = {
      total: tasks.length,
      todo: 0,
      inProgress: 0,
      review: 0,
      completed: 0,
    };

    tasks.forEach((task) => {
      const status = task.status?.toLowerCase();

      if (status === "todo") {
        taskStats.todo++;
      } else if (
        status === "in-progress" ||
        status === "in_progress"
      ) {
        taskStats.inProgress++;
      } else if (
        status === "in-review" ||
        status === "review"
      ) {
        taskStats.review++;
      } else if (
        status === "completed" ||
        status === "done"
      ) {
        taskStats.completed++;
      }
    });

    // -----------------------------
    // ISSUE STATISTICS
    // -----------------------------

    const issueStats = {
      total: issues.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
    };

    issues.forEach((issue) => {
      const status = issue.status?.toLowerCase();

      if (
        status === "open" ||
        status === "todo"
      ) {
        issueStats.open++;
      } else if (
        status === "in-progress" ||
        status === "in_progress"
      ) {
        issueStats.inProgress++;
      } else if (
        status === "resolved" ||
        status === "closed" ||
        status === "completed"
      ) {
        issueStats.resolved++;
      }
    });

    // -----------------------------
    // PROJECT PROGRESS
    // -----------------------------

    const projectProgress =
      projects.map((project) => {
        const projectTasks =
          tasks.filter(
            (task) =>
              task.project.toString() ===
              project._id.toString()
          );

        const completed =
          projectTasks.filter((task) => {
            const status =
              task.status?.toLowerCase();

            return (
              status === "completed" ||
              status === "done"
            );
          }).length;

        const total = projectTasks.length;

        const progress =
          total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
              );

        return {
          _id: project._id,
          name: project.name,
          totalTasks: total,
          completedTasks: completed,
          progress,
        };
      });

    return res.status(200).json({
      success: true,

      data: {
        projects: {
          total: projects.length,
        },

        tasks: taskStats,

        issues: issueStats,

        projectProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};