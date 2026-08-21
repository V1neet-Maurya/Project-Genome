import Project from "../models/Project.js";
import User from "../models/User.js";

import {
  generateProjectPlan,
} from "../services/ai/projectPlannerService.js";

export const generateProjectPlanController =
  async (req, res, next) => {
    try {
      const {
        projectId,
      } = req.params;

      const {
        requirements,
      } = req.body;

      if (!requirements?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Project requirements are required",
        });
      }

      // -------------------------------
      // SECURITY
      // -------------------------------

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

      // -------------------------------
      // TEAM
      // -------------------------------

      const memberIds =
        project.members || [];

      const team =
        await User.find({
          _id: {
            $in: memberIds,
          },
        })
          .select(
            "_id firstName lastName email"
          )
          .lean();

      // -------------------------------
      // GENERATE PLAN
      // -------------------------------

      const plan =
        await generateProjectPlan({
          project: {
            _id: project._id,
            name: project.name,
            description:
              project.description || "",
            deadline:
              project.deadline || null,
          },

          requirements,

          team,
        });

      return res.status(200).json({
        success: true,

        message:
          "AI project plan generated successfully",

        data: plan,
      });
    } catch (error) {
      console.error(
        "AI project planner error:",
        error
      );

      next(error);
    }
  };