import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Issue from "../models/Issue.js";

export const getDashboard = async (req, res, next) => {
  try {
    console.log("🔥 NEW DASHBOARD CONTROLLER RUNNING");

    const userId = req.user._id;

    // =====================================================
    // PROJECTS
    // Owner OR Member
    // =====================================================

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
      .select(
        "_id name owner members createdAt"
      )
      .sort({
        createdAt: -1,
      });

    const projectIds = projects.map(
      (project) => project._id
    );

    // =====================================================
    // TASKS
    // =====================================================

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

    // =====================================================
    // ISSUES
    // =====================================================

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

    // =====================================================
    // TASK STATISTICS
    // =====================================================

    const totalTasks = tasks.length;

    const todoTasks = tasks.filter(
      (task) => task.status === "todo"
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

    // =====================================================
    // ISSUE STATISTICS
    // =====================================================

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

    // =====================================================
    // TEAM MEMBERS
    // =====================================================

    const teamMemberIds = new Set();

    projects.forEach((project) => {
      if (project.owner) {
        teamMemberIds.add(
          project.owner.toString()
        );
      }

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

    // =====================================================
    // OVERALL TASK PROGRESS
    // =====================================================

    const taskProgress =
      totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks /
              totalTasks) *
              100
          );

    // =====================================================
    // PROJECT PROGRESS
    // =====================================================

    const projectData = projects.map(
      (project) => {
        const projectId =
          project._id.toString();

        const projectTasks =
          tasks.filter((task) => {
            const taskProjectId =
              task.project?._id?.toString();

            return (
              taskProjectId === projectId
            );
          });

        const totalProjectTasks =
          projectTasks.length;

        const completedProjectTasks =
          projectTasks.filter(
            (task) =>
              task.status === "completed"
          ).length;

        const progress =
          totalProjectTasks === 0
            ? 0
            : Math.round(
                (completedProjectTasks /
                  totalProjectTasks) *
                  100
              );

        return {
          _id: project._id,
          name: project.name,
          owner: project.owner,
          members: project.members,
          createdAt: project.createdAt,

          progress,

          totalTasks:
            totalProjectTasks,

          completedTasks:
            completedProjectTasks,
        };
      }
    );

    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
      "🔥 PROJECT COUNT:",
      projectData.length
    );

    console.log(
      "🔥 PROJECTS BEING RETURNED:",
      projectData
    );

    // =====================================================
    // RECENT DATA
    // =====================================================

    const recentTasks =
      tasks.slice(0, 5);

    const recentIssues =
      issues.slice(0, 5);

    // =====================================================
    // FINAL RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      data: {
        // ⭐ IMPORTANT
        projects: projectData,

        stats: {
          projects:
            projects.length,

          tasks:
            totalTasks,

          issues:
            totalIssues,

          completedTasks,

          criticalIssues,

          openIssues,

          taskProgress,

          teamMembers:
            totalTeamMembers,
        },

        tasks: {
          todo:
            todoTasks,

          inProgress:
            inProgressTasks,

          inReview:
            inReviewTasks,

          completed:
            completedTasks,
        },

        issues: {
          open:
            openIssues,

          inProgress:
            inProgressIssues,

          resolved:
            resolvedIssues,

          closed:
            closedIssues,

          critical:
            criticalIssues,
        },

        recentTasks,

        recentIssues,
      },
    });
  } catch (error) {
    console.error(
      "❌ DASHBOARD ERROR:",
      error
    );

    next(error);
  }
};