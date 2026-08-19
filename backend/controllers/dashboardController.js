import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Issue from "../models/Issue.js";

export const getDashboard = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    // =============================================
    // PROJECTS
    // Owner OR Member
    // =============================================

    const projects = await Project.find({
      $or: [
        {
          owner: userId,
        },
        {
          "members.user": userId,
        },
      ],
    })
      .select("_id name owner members")
      .sort({
        createdAt: -1,
      });

    const projectIds = projects.map(
      (project) => project._id
    );

    // =============================================
    // TASKS
    // =============================================

    const tasks = await Task.find({
      project: {
        $in: projectIds,
      },
    })
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

    // =============================================
    // ISSUES
    // =============================================

    const issues = await Issue.find({
      project: {
        $in: projectIds,
      },
    })
      .populate("project", "name")
      .populate(
        "createdBy",
        "firstName lastName email"
      )
      .sort({
        createdAt: -1,
      });

    // =============================================
    // TASK STATISTICS
    // =============================================

    const totalTasks = tasks.length;

    const todoTasks = tasks.filter(
      (task) =>
        task.status === "todo"
    ).length;

    const inProgressTasks = tasks.filter(
      (task) =>
        task.status === "in-progress"
    ).length;

    const inReviewTasks = tasks.filter(
      (task) =>
        task.status === "in-review"
    ).length;

    const completedTasks = tasks.filter(
      (task) =>
        task.status === "completed"
    ).length;

    // =============================================
    // ISSUE STATISTICS
    // =============================================

    const totalIssues = issues.length;

    const openIssues = issues.filter(
      (issue) =>
        issue.status === "open"
    ).length;

    const inProgressIssues = issues.filter(
      (issue) =>
        issue.status === "in-progress"
    ).length;

    const resolvedIssues = issues.filter(
      (issue) =>
        issue.status === "resolved"
    ).length;

    const closedIssues = issues.filter(
      (issue) =>
        issue.status === "closed"
    ).length;

    const criticalIssues = issues.filter(
      (issue) =>
        issue.priority === "critical"
    ).length;

    // =============================================
    // TEAM MEMBERS
    // Count unique owners + members
    // =============================================

    const teamMemberIds = new Set();

    projects.forEach((project) => {
      // Add project owner
      if (project.owner) {
        teamMemberIds.add(
          project.owner.toString()
        );
      }

      // Add project members
      project.members?.forEach((member) => {
        if (member.user) {
          teamMemberIds.add(
            member.user.toString()
          );
        }
      });
    });

    const totalTeamMembers =
      teamMemberIds.size;

    // =============================================
    // TASK PROGRESS
    // =============================================

    const taskProgress =
      totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks /
              totalTasks) *
              100
          );

    // =============================================
    // RECENT DATA
    // =============================================

    const recentTasks = tasks.slice(
      0,
      5
    );

    const recentIssues = issues.slice(
      0,
      5
    );

    // =============================================
    // RESPONSE
    // =============================================

    return res.status(200).json({
      success: true,

      data: {
        stats: {
          projects: projects.length,
          tasks: totalTasks,
          issues: totalIssues,
          completedTasks,
          criticalIssues,
          taskProgress,
          teamMembers: totalTeamMembers,
        },

        tasks: {
          todo: todoTasks,
          inProgress: inProgressTasks,
          inReview: inReviewTasks,
          completed: completedTasks,
        },

        issues: {
          open: openIssues,
          inProgress: inProgressIssues,
          resolved: resolvedIssues,
          closed: closedIssues,
          critical: criticalIssues,
        },

        recentTasks,
        recentIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};