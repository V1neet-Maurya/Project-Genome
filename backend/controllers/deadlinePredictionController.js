import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Issue from "../models/Issue.js";

import {
  calculateDeadlineMetrics,
} from "../services/ai/deadlineCalculator.js";

// =====================================================
// PREDICT PROJECT DEADLINE
// =====================================================

export const predictProjectDeadline =
  async (req, res, next) => {
    try {
      const { projectId } =
        req.params;

      // -------------------------------------------------
      // FIND PROJECT
      // -------------------------------------------------

      const project =
        await Project.findOne({
          _id: projectId,

          $or: [
            {
              owner:
                req.user._id,
            },

            {
              "members.user":
                req.user._id,
            },
          ],
        });

      if (!project) {
        return res.status(404).json({
          success: false,

          message:
            "Project not found or you do not have access.",
        });
      }

      // -------------------------------------------------
      // DEADLINE CHECK
      // -------------------------------------------------

      if (!project.deadline) {
        return res.status(400).json({
          success: false,

          message:
            "Project deadline is not defined.",
        });
      }

      // -------------------------------------------------
      // GET TASKS
      // -------------------------------------------------

      const tasks =
        await Task.find({
          project: projectId,
        });

      // -------------------------------------------------
      // GET ISSUES
      // -------------------------------------------------

      const issues =
        await Issue.find({
          project: projectId,
        });

      // -------------------------------------------------
      // CALCULATE DEADLINE METRICS
      // -------------------------------------------------

      const metrics =
        calculateDeadlineMetrics({
          tasks,

          deadline:
            project.deadline,
        });

      // -------------------------------------------------
      // PROJECT CONTEXT
      // -------------------------------------------------

      const context = {
        project: {
          _id:
            project._id,

          name:
            project.name,

          deadline:
            project.deadline,
        },

        metrics,

        currentDate:
          new Date()
            .toISOString()
            .split("T")[0],
      };

      // -------------------------------------------------
      // RISK LEVEL
      // -------------------------------------------------

      let riskLevel =
        "low";

      if (
        metrics.delayDays >
          7 ||
        metrics.overdueTasks >=
          3
      ) {
        riskLevel =
          "high";
      } else if (
        metrics.delayDays >
          0 ||
        metrics.overdueTasks >
          0
      ) {
        riskLevel =
          "medium";
      }

      // -------------------------------------------------
      // STATUS
      // -------------------------------------------------

      const status =
        metrics.delayDays > 0
          ? "delayed"
          : "on-track";

      // -------------------------------------------------
      // CONFIDENCE
      // -------------------------------------------------

      let confidence = 70;

      if (
        metrics.totalTasks >=
        10
      ) {
        confidence += 10;
      }

      if (
        metrics.completedTasks >
        0
      ) {
        confidence += 10;
      }

      if (
        metrics.overdueTasks ===
        0
      ) {
        confidence += 5;
      }

      confidence =
        Math.min(
          confidence,
          95
        );

      // -------------------------------------------------
      // REASON
      // -------------------------------------------------

      let reason =
        "Current project progress appears to be on track.";

      if (
        metrics.delayDays >
        0
      ) {
        reason =
          "Current completion velocity is below the required rate.";
      } else if (
        metrics.overdueTasks >
        0
      ) {
        reason =
          "The project has overdue tasks that may affect completion.";
      } else if (
        metrics.remainingTasks >
        0
      ) {
        reason =
          "The project still has remaining work but current velocity is sufficient.";
      }

      // -------------------------------------------------
      // RECOMMENDATIONS
      // -------------------------------------------------

      const recommendations =
        [];

      if (
        metrics.reviewTasks >
        0
      ) {
        recommendations.push(
          "Prioritize blocked or in-review tasks"
        );
      }

      if (
        metrics.overdueTasks >
        0
      ) {
        recommendations.push(
          "Reduce overdue tasks"
        );
      }

      if (
        metrics.remainingTasks >
        0
      ) {
        recommendations.push(
          "Increase development velocity"
        );
      }

      if (
        issues.length > 0
      ) {
        recommendations.push(
          "Resolve high-priority project issues"
        );
      }

      if (
        recommendations.length ===
        0
      ) {
        recommendations.push(
          "Continue monitoring project progress"
        );
      }

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      return res.status(200).json({
        success: true,

        message:
          "Deadline prediction generated successfully",

        data: {
          originalDeadline:
            project.deadline,

          predictedCompletionDate:
            metrics.predictedCompletionDate,

          delayDays:
            metrics.delayDays,

          confidence,

          riskLevel,

          status,

          reason,

          recommendations,

          // Keep the complete metrics
          // available for the UI.
          statistics: {
            ...metrics,

            totalIssues:
              issues.length,
          },

          // Context is included so
          // future Gemini integration
          // can consume the same data.
          context,
        },
      });
    } catch (error) {
      console.error(
        "Deadline prediction error:",
        error
      );

      next(error);
    }
  };