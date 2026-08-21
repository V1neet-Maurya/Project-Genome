import Milestone from "../models/Milestone.js";
import Project from "../models/Project.js";

// =====================================================
// CREATE MILESTONE
// =====================================================

export const createMilestone = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      description,
      project,
      status,
      startDate,
      dueDate,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Milestone name is required",
      });
    }

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    const projectExists =
      await Project.findOne({
        _id: project,
        owner: req.user._id,
      });

    if (!projectExists) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    const milestone =
      await Milestone.create({
        name: name.trim(),
        description,
        project,
        createdBy: req.user._id,
        status,
        startDate,
        dueDate,
      });

    return res.status(201).json({
      success: true,
      message:
        "Milestone created successfully",
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET PROJECT MILESTONES
// =====================================================

export const getMilestones = async (
  req,
  res,
  next
) => {
  try {
    const { projectId } = req.params;

    const project =
      await Project.findOne({
        _id: projectId,
        owner: req.user._id,
      });

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    const milestones =
      await Milestone.find({
        project: projectId,
      })
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .sort({
          order: 1,
          createdAt: 1,
        });

    return res.status(200).json({
      success: true,
      count: milestones.length,
      data: milestones,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET SINGLE MILESTONE
// =====================================================

export const getMilestoneById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const milestone =
        await Milestone.findById(
          req.params.id
        );

      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: "Milestone not found",
        });
      }

      const project =
        await Project.findOne({
          _id: milestone.project,
          owner: req.user._id,
        });

      if (!project) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this milestone",
        });
      }

      return res.status(200).json({
        success: true,
        data: milestone,
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// UPDATE MILESTONE
// =====================================================

export const updateMilestone =
  async (
    req,
    res,
    next
  ) => {
    try {
      const milestone =
        await Milestone.findById(
          req.params.id
        );

      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: "Milestone not found",
        });
      }

      const project =
        await Project.findOne({
          _id: milestone.project,
          owner: req.user._id,
        });

      if (!project) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this milestone",
        });
      }

      const allowedFields = [
        "name",
        "description",
        "status",
        "startDate",
        "dueDate",
        "order",
      ];

      allowedFields.forEach(
        (field) => {
          if (
            req.body[field] !== undefined
          ) {
            milestone[field] =
              req.body[field];
          }
        }
      );

      await milestone.save();

      return res.status(200).json({
        success: true,
        message:
          "Milestone updated successfully",
        data: milestone,
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// DELETE MILESTONE
// =====================================================

export const deleteMilestone =
  async (
    req,
    res,
    next
  ) => {
    try {
      const milestone =
        await Milestone.findById(
          req.params.id
        );

      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: "Milestone not found",
        });
      }

      const project =
        await Project.findOne({
          _id: milestone.project,
          owner: req.user._id,
        });

      if (!project) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this milestone",
        });
      }

      await Milestone.findByIdAndDelete(
        milestone._id
      );

      return res.status(200).json({
        success: true,
        message:
          "Milestone deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };