import Project from "../models/Project.js";
import Task from "../models/Task.js";
import TeamWorkload from "../models/TeamWorkload.js";

import {
  calculateTeamWorkload,
} from "../services/ai/workloadCalculator.js";

import {
  analyzeTeamWorkload,
} from "../services/ai/workloadService.js";

export const generateTeamWorkload =
  async (req, res, next) => {
    try {
      const {
        projectId,
      } = req.params;

      // ----------------------------------
      // Verify project ownership
      // ----------------------------------

      const project =
        await Project.findOne({
          _id: projectId,
          owner: req.user._id,
        }).lean();

      if (!project) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this project",
        });
      }

      // ----------------------------------
      // Get tasks
      // ----------------------------------

      const tasks =
        await Task.find({
          project: projectId,
        }).lean();

      // ----------------------------------
      // Get project members
      // ----------------------------------

      /*
       * IMPORTANT:
       * Use the actual team-members field
       * from your Project schema here.
       *
       * This implementation assumes:
       *
       * project.members = [user IDs]
       */

      const memberIds =
        project.members || [];

      const members =
        await import("../models/User.js")
          .then(({ default: User }) =>
            User.find({
              _id: {
                $in: memberIds,
              },
            })
              .select(
                "firstName lastName email"
              )
              .lean()
          );

      // ----------------------------------
      // Calculate workload
      // ----------------------------------

      const workload =
        calculateTeamWorkload(
          tasks,
          members
        );

      // ----------------------------------
      // AI interpretation
      // ----------------------------------

      const ai =
        await analyzeTeamWorkload(
          workload
        );

      // ----------------------------------
      // Save
      // ----------------------------------

      const saved =
        await TeamWorkload.create({
          project: projectId,

          analyzedBy:
            req.user._id,

          members: workload.map(
            (item) => ({
              member:
                item.member._id,

              totalTasks:
                item.totalTasks,

              completedTasks:
                item.completedTasks,

              activeTasks:
                item.activeTasks,

              overdueTasks:
                item.overdueTasks,

              blockedTasks:
                item.blockedTasks,

              highPriorityTasks:
                item.highPriorityTasks,

              workloadScore:
                item.workloadScore,

              workloadLevel:
                item.workloadLevel,
            })
          ),

          aiSummary:
            ai.summary,

          aiRecommendations:
            ai.recommendations || [],
        });

      return res.status(201).json({
        success: true,

        message:
          "Team workload analyzed successfully",

        data: {
          workload: saved,

          ai,
        },
      });
    } catch (error) {
      next(error);
    }
  };