import Activity from "../models/Activity.js";
import Project from "../models/Project.js";

export const getActivities = async (
  req,
  res,
  next
) => {
  try {
    const projects = await Project.find({
      owner: req.user._id,
    }).select("_id");

    const projectIds = projects.map(
      (project) => project._id
    );

    const activities =
      await Activity.find({
        project: {
          $in: projectIds,
        },
      })
        .populate(
          "user",
          "firstName lastName profilePic"
        )
        .populate(
          "project",
          "name"
        )
        .sort({
          createdAt: -1,
        })
        .limit(50);

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};