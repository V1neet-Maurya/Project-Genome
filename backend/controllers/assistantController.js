import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Issue from "../models/Issue.js";
import Milestone from "../models/Milestone.js";
import CodeAnalysis from "../models/CodeAnalysis.js";
import ProjectRisk from "../models/ProjectRisk.js";
import DeadlinePrediction from "../models/DeadlinePrediction.js";
import TeamWorkload from "../models/TeamWorkload.js";

import {
  askGenomeAI,
} from "../services/ai/assistantService.js";

// =====================================================
// ASK GENOME AI ASSISTANT
// =====================================================

export const askAssistant =
  async (req, res, next) => {
    try {
      const {
        projectId,
      } = req.params;

      const {
        question,
      } = req.body || {};

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
      // VALIDATE QUESTION
      // =================================================

      if (
        !question ||
        !question.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Question is required",
        });
      }

      // =================================================
      // CHECK PROJECT ACCESS
      // OWNER OR MEMBER
      // =================================================

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
        }).lean();

      if (!project) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this project",
        });
      }

      // =================================================
      // GET PROJECT TASKS
      // =================================================

      const tasks =
        await Task.find({
          project: projectId,
        })
          .select(
            "title description status priority assignedTo dueDate milestone createdAt"
          )
          .populate(
            "assignedTo",
            "firstName lastName email"
          )
          .lean();

      // =================================================
      // GET PROJECT ISSUES
      // =================================================

      const issues =
        await Issue.find({
          project: projectId,
        })
          .select(
            "title description status priority severity createdAt"
          )
          .lean();

      // =================================================
      // GET PROJECT MILESTONES
      // =================================================

      const milestones =
        await Milestone.find({
          project: projectId,
        })
          .select(
            "name description status dueDate startDate order"
          )
          .lean();

      // =================================================
      // GET LATEST CODE ANALYSIS
      // =================================================

      const codeAnalysis =
        await CodeAnalysis.findOne({
          project: projectId,
          analyzedBy:
            req.user._id,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      // =================================================
      // GET LATEST PROJECT RISK
      // =================================================

      const projectRisk =
        await ProjectRisk.findOne({
          project: projectId,
          analyzedBy:
            req.user._id,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      // =================================================
      // GET LATEST DEADLINE PREDICTION
      // =================================================

      const deadline =
        await DeadlinePrediction.findOne({
          project: projectId,
          predictedBy:
            req.user._id,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      // =================================================
      // GET LATEST TEAM WORKLOAD
      // =================================================

      const teamWorkload =
        await TeamWorkload.findOne({
          project: projectId,
          analyzedBy:
            req.user._id,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      // =================================================
      // BUILD AI CONTEXT
      // =================================================

      const context = {
        project: {
          _id:
            project._id,

          name:
            project.name,

          description:
            project.description || "",

          status:
            project.status,

          visibility:
            project.visibility,

          technologies:
            project.technologies || [],

          deadline:
            project.deadline || null,

          progress:
            project.progress || 0,
        },

        tasks,

        issues,

        milestones,

        codeAnalysis:
          codeAnalysis
            ? {
                scores:
                  codeAnalysis.scores ||
                  null,

                findings:
                  codeAnalysis.findings ||
                  [],

                testResults:
                  codeAnalysis.testResults ||
                  null,

                aiReview:
                  codeAnalysis.aiReview ||
                  null,
              }
            : null,

        projectRisk:
          projectRisk || null,

        deadline:
          deadline || null,

        teamWorkload:
          teamWorkload || null,
      };

      // =================================================
      // ASK GENOME AI
      // =================================================

      const answer =
        await askGenomeAI({
          question:
            question.trim(),

          context,
        });

      // =================================================
      // VALIDATE AI RESPONSE
      // =================================================

      if (!answer) {
        return res.status(500).json({
          success: false,
          message:
            "Genome AI returned an empty response",
        });
      }

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        success: true,

        message:
          "Genome AI response generated successfully",

        data: answer,
      });
    } catch (error) {
      console.error(
        "Genome AI Assistant error:",
        error
      );

      next(error);
    }
  };