import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Issue from "../models/Issue.js";
import CodeAnalysis from "../models/CodeAnalysis.js";
import ProjectRisk from "../models/ProjectRisk.js";
import DeadlinePrediction from "../models/DeadlinePrediction.js";

import {
  generateProjectSummary,
} from "../services/ai/projectSummaryService.js";


// =====================================================
// GENERATE PROJECT SUMMARY
// =====================================================

export const generateProjectSummaryController =
  async (req, res, next) => {
    try {
      const {
        projectId,
      } = req.params;

      // =================================================
      // VALIDATE PROJECT ID
      // =================================================

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message:
            "Project ID is required",
        });
      }

      // =================================================
      // FIND PROJECT
      // =================================================

      const project =
        await Project.findById(
          projectId
        ).lean();

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      // =================================================
      // USER ID
      // =================================================

      const userId =
        req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "User authentication required",
        });
      }

      // =================================================
      // CHECK PROJECT ACCESS
      //
      // Owner OR project member can access.
      // =================================================

      const isOwner =
        project.owner?.toString() ===
        userId;

      const isMember =
        Array.isArray(project.members) &&
        project.members.some(
          (member) =>
            member.user?.toString() ===
            userId
        );

      if (!isOwner && !isMember) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this project",
        });
      }

      // =================================================
      // TASKS
      // =================================================

      const tasks =
        await Task.find({
          project: projectId,
        }).lean();

      const totalTasks =
        tasks.length;

      const completedTasks =
        tasks.filter(
          (task) =>
            task.status ===
              "completed" ||
            task.status === "done"
        ).length;

      const overdueTasks =
        tasks.filter((task) => {

          if (!task.dueDate) {
            return false;
          }

          return (
            new Date(task.dueDate) <
              new Date() &&
            task.status !==
              "completed" &&
            task.status !== "done"
          );
        }).length;

      const blockedTasks =
        tasks.filter(
          (task) =>
            task.status === "blocked"
        ).length;

      const progress =
        totalTasks > 0
          ? Math.round(
              (completedTasks /
                totalTasks) *
                100
            )
          : 0;

      // =================================================
      // ISSUES
      // =================================================

      const issues =
        await Issue.find({
          project: projectId,
        }).lean();

      const openIssues =
        issues.filter(
          (issue) =>
            issue.status !==
              "closed" &&
            issue.status !==
              "resolved"
        ).length;

      const highPriorityIssues =
        issues.filter(
          (issue) =>
            issue.priority ===
              "high" ||
            issue.priority ===
              "critical"
        ).length;

      // =================================================
      // LATEST CODELAB
      // =================================================

      /*
       * Don't unnecessarily restrict CodeAnalysis
       * to the current user.
       *
       * The project has already been authorized.
       * We want the latest analysis for this project.
       */

      const codeLab =
        await CodeAnalysis.findOne({
          project: projectId,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      // =================================================
      // LATEST PROJECT RISK
      // =================================================

      const risk =
        await ProjectRisk.findOne({
          project: projectId,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      // =================================================
      // LATEST DEADLINE
      // =================================================

      const deadline =
        await DeadlinePrediction.findOne({
          project: projectId,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      // =================================================
      // AI CONTEXT
      // =================================================

      const context = {

        project: {
          _id:
            project._id,

          name:
            project.name,

          description:
            project.description ||
            "",

          deadline:
            project.deadline ||
            null,

          status:
            project.status,

          progress:
            project.progress || 0,

          technologies:
            project.technologies ||
            [],
        },

        taskMetrics: {
          totalTasks,

          completedTasks,

          overdueTasks,

          blockedTasks,

          progress,
        },

        issueMetrics: {
          totalIssues:
            issues.length,

          openIssues,

          highPriorityIssues,
        },

        codeLab: codeLab
          ? {
              score:
                codeLab.scores
                  ?.overall ?? 0,

              quality:
                codeLab.scores
                  ?.codeQuality ?? 0,

              security:
                codeLab.scores
                  ?.security ?? 0,

              testing:
                codeLab.scores
                  ?.testing ?? 0,

              architecture:
                codeLab.scores
                  ?.architecture ?? 0,

              maintainability:
                codeLab.scores
                  ?.maintainability ?? 0,

              documentation:
                codeLab.scores
                  ?.documentation ?? 0,

              findings:
                codeLab.findings || [],

              testResults:
                codeLab.testResults ||
                null,
            }
          : null,

        risk: risk
          ? {
              score:
                risk.overallRisk
                  ?.score ?? 0,

              level:
                risk.overallRisk
                  ?.level ??
                "low",

              summary:
                risk.overallRisk
                  ?.summary ??
                "",
            }
          : null,

        deadline: deadline
          ? {
              predictedCompletionDate:
                deadline.predictedCompletionDate,

              delayDays:
                deadline.delayDays ?? 0,

              confidence:
                deadline.confidence ?? 0,

              riskLevel:
                deadline.riskLevel ??
                "low",
            }
          : null,
      };

      // =================================================
      // GENERATE AI SUMMARY
      // =================================================

      const summary =
        await generateProjectSummary(
          context
        );

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        success: true,

        message:
          "Project summary generated successfully",

        data: {
          project:
            projectId,

          summary,

          metrics:
            context,
        },
      });

    } catch (error) {

      console.error(
        "Project summary error:",
        error
      );

      next(error);
    }
  };