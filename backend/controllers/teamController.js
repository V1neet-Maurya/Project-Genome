import Project from "../models/Project.js";
import User from "../models/User.js";

// =====================================================
// GET PROJECT MEMBERS
// =====================================================

export const getProjectMembers = async (req, res, next) => {
  try {
    const project = req.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await project.populate(
      "members.user",
      "firstName lastName email profilePic"
    );

    return res.status(200).json({
      success: true,
      data: project.members || [],
    });
  } catch (error) {
    console.error("GET MEMBERS ERROR:", error);

    next(error);
  }
};

// =====================================================
// ADD MEMBER
// =====================================================

export const addMember = async (req, res, next) => {
  try {
    const { email, role = "developer" } = req.body;

    console.log("========== ADD MEMBER ==========");
    console.log("Project ID:", req.params.projectId);
    console.log("Body:", req.body);
    console.log("Logged user:", req.user?._id);
    console.log("================================");

    // -------------------------------------------------
    // Validate email
    // -------------------------------------------------

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    // -------------------------------------------------
    // Project
    // -------------------------------------------------

    const project = req.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // -------------------------------------------------
    // Validate role
    // -------------------------------------------------

    const allowedRoles = [
      "admin",
      "developer",
      "viewer",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member role",
      });
    }

    // -------------------------------------------------
    // Find user
    // -------------------------------------------------

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No user found with email ${normalizedEmail}`,
      });
    }

    // -------------------------------------------------
    // Owner cannot be added again
    // -------------------------------------------------

    if (
      project.owner &&
      project.owner.toString() ===
        user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Project owner is already a member",
      });
    }

    // -------------------------------------------------
    // Make sure members exists
    // -------------------------------------------------

    if (!Array.isArray(project.members)) {
      project.members = [];
    }

    // -------------------------------------------------
    // IMPORTANT:
    // Remove old/broken ObjectId-only member records
    // -------------------------------------------------

    project.members = project.members.filter(
      (member) => {
        return (
          member &&
          typeof member === "object" &&
          member.user
        );
      }
    );

    // -------------------------------------------------
    // Check duplicate
    // -------------------------------------------------

    const alreadyMember =
      project.members.some((member) => {
        const memberUserId =
          member.user?._id ||
          member.user;

        return (
          memberUserId &&
          memberUserId.toString() ===
            user._id.toString()
        );
      });

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message:
          "User is already a project member",
      });
    }

    // -------------------------------------------------
    // ADD MEMBER
    // -------------------------------------------------

    project.members.push({
      user: user._id,
      role: role,
      joinedAt: new Date(),
    });

    await project.save();

    // -------------------------------------------------
    // Populate members
    // -------------------------------------------------

    await project.populate({
      path: "members.user",
      select:
        "firstName lastName email profilePic",
    });

    console.log(
      "Members after add:",
      project.members
    );

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: project.members,
    });
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "ADD MEMBER SERVER ERROR:"
    );

    console.error(error);

    console.error(
      "================================"
    );

    next(error);
  }
};

// =====================================================
// UPDATE MEMBER ROLE
// =====================================================

export const updateMemberRole = async (
  req,
  res,
  next
) => {
  try {
    const { role } = req.body;

    const project = req.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const allowedRoles = [
      "admin",
      "developer",
      "viewer",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member role",
      });
    }

    const member =
      project.members.find((member) => {
        const memberUserId =
          member?.user?._id ||
          member?.user;

        return (
          memberUserId &&
          memberUserId.toString() ===
            req.params.userId
        );
      });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    member.role = role;

    await project.save();

    return res.status(200).json({
      success: true,
      message:
        "Member role updated successfully",
    });
  } catch (error) {
    console.error(
      "UPDATE MEMBER ROLE ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// REMOVE MEMBER
// =====================================================

export const removeMember = async (
  req,
  res,
  next
) => {
  try {
    const project = req.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const userId =
      req.params.userId;

    const memberExists =
      project.members.some((member) => {
        const memberUserId =
          member?.user?._id ||
          member?.user;

        return (
          memberUserId &&
          memberUserId.toString() ===
            userId
        );
      });

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    project.members =
      project.members.filter((member) => {
        const memberUserId =
          member?.user?._id ||
          member?.user;

        return (
          !memberUserId ||
          memberUserId.toString() !==
            userId
        );
      });

    await project.save();

    return res.status(200).json({
      success: true,
      message:
        "Member removed successfully",
    });
  } catch (error) {
    console.error(
      "REMOVE MEMBER ERROR:",
      error
    );

    next(error);
  }
};