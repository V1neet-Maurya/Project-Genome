import Project from "../models/Project.js";

import Task from "../models/Task.js";

import Milestone from "../models/Milestone.js";

import {
  generateTaskPlan,
} from "../services/ai/taskGenerationService.js";

// =====================================================
// GENERATE AI TASK PLAN
// =====================================================

export const generateTaskPlanController =
  async (req, res, next) => {
    try {
      // -------------------------------------------------
      // SAFELY READ REQUEST BODY
      // -------------------------------------------------

      const {
        prompt,
      } = req.body || {};

      const {
        projectId,
      } = req.params;

      // -------------------------------------------------
      // VALIDATE PROJECT ID
      // -------------------------------------------------

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message:
            "Project ID is required",
        });
      }

      // -------------------------------------------------
      // VALIDATE PROMPT
      // -------------------------------------------------

      if (
        !prompt ||
        !prompt.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Prompt is required",
        });
      }

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
      // BUILD AI INPUT
      // -------------------------------------------------

      const projectContext = {
        project: {
          _id:
            project._id,

          name:
            project.name,

          description:
            project.description || "",

          technologies:
            project.technologies || [],

          deadline:
            project.deadline || null,

          status:
            project.status,

          progress:
            project.progress || 0,
        },

        prompt:
          prompt.trim(),
      };

      // -------------------------------------------------
      // GENERATE AI PLAN
      // -------------------------------------------------

      const taskPlan =
        await generateTaskPlan(
          projectContext
        );

      // -------------------------------------------------
      // VALIDATE AI RESPONSE
      // -------------------------------------------------

      if (!taskPlan) {
        return res.status(500).json({
          success: false,
          message:
            "AI returned an empty task plan",
        });
      }

      // -------------------------------------------------
      // RETURN AI PLAN
      // -------------------------------------------------

      return res.status(200).json({
        success: true,

        message:
          "AI task plan generated successfully",

        data: taskPlan,
      });
    } catch (error) {
      console.error(
        "AI task generation error:",
        error
      );

      next(error);
    }
  };

// =====================================================
// ACCEPT AI TASK PLAN
// =====================================================

export const acceptAIPlan =
  async (req, res, next) => {
    try {
      const {
        projectId,
        milestones,
      } = req.body || {};

      // -------------------------------------------------
      // VALIDATE PROJECT ID
      // -------------------------------------------------

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message:
            "Project ID is required",
        });
      }

      // -------------------------------------------------
      // VALIDATE MILESTONES
      // -------------------------------------------------

      if (
        !Array.isArray(
          milestones
        ) ||
        milestones.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Milestones are required",
        });
      }

      // -------------------------------------------------
      // CHECK PROJECT ACCESS
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
      // CREATED DATA
      // -------------------------------------------------

      const createdMilestones = [];

      const createdTasks = [];

      // -------------------------------------------------
      // CREATE MILESTONES + TASKS
      // -------------------------------------------------

      for (
        const milestoneData of milestones
      ) {
        // -----------------------------------------------
        // VALIDATE MILESTONE
        // -----------------------------------------------

        if (
          !milestoneData?.title?.trim()
        ) {
          continue;
        }

        // -----------------------------------------------
        // CREATE MILESTONE
        // -----------------------------------------------

        const milestone =
          await Milestone.create({
            // IMPORTANT:
            // Your Milestone model requires "name"
            name:
              milestoneData.title.trim(),

            description:
              milestoneData.description ||
              "",

            project:
              projectId,

            // IMPORTANT:
            // Your Milestone model requires "createdBy"
            createdBy:
              req.user._id,
          });

        createdMilestones.push(
          milestone
        );

        // -----------------------------------------------
        // CREATE TASKS
        // -----------------------------------------------

        if (
          !Array.isArray(
            milestoneData.tasks
          )
        ) {
          continue;
        }

        for (
          const taskData of
            milestoneData.tasks
        ) {
          // ---------------------------------------------
          // VALIDATE TASK
          // ---------------------------------------------

          if (
            !taskData?.title?.trim()
          ) {
            continue;
          }

          // ---------------------------------------------
          // CREATE TASK
          // ---------------------------------------------

          const task =
            await Task.create({
              title:
                taskData.title.trim(),

              description:
                taskData.description ||
                "",

              project:
                projectId,

              milestone:
                milestone._id,

              status:
                "todo",

              priority:
                taskData.priority ||
                "medium",

              // Your Task model requires createdBy
              createdBy:
                req.user._id,
            });

          createdTasks.push(
            task
          );
        }
      }

      // -------------------------------------------------
      // CHECK CREATION
      // -------------------------------------------------

      if (
        createdMilestones.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No valid milestones were provided",
        });
      }

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      return res.status(201).json({
        success: true,

        message:
          "AI project plan created successfully",

        data: {
          milestones:
            createdMilestones,

          tasks:
            createdTasks,

          milestoneCount:
            createdMilestones.length,

          taskCount:
            createdTasks.length,
        },
      });
    } catch (error) {
      console.error(
        "Accept AI plan error:",
        error
      );

      next(error);
    }
  };