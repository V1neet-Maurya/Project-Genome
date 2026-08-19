import Project from "../models/Project.js";

const projectAccess = async (
  req,
  res,
  next
) => {
  try {
    const projectId =
      req.params.projectId ||
      req.body.project ||
      req.params.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project =
      await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const currentUserId =
      req.user._id.toString();

    // =====================================================
    // OWNER
    // =====================================================

    if (
      project.owner &&
      project.owner.toString() ===
        currentUserId
    ) {
      req.project = project;
      req.projectRole = "owner";

      return next();
    }

    // =====================================================
    // MEMBER
    // =====================================================

    const member =
      project.members?.find((member) => {
        const memberUserId =
          member?.user?._id ||
          member?.user;

        return (
          memberUserId &&
          memberUserId.toString() ===
            currentUserId
        );
      });

    if (!member) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    req.project = project;
    req.projectRole =
      member.role || "viewer";

    return next();
  } catch (error) {
    console.error(
      "Project access error:",
      error
    );

    next(error);
  }
};

export default projectAccess;