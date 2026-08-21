import Project from "../models/Project.js";

// =====================================================
// CREATE PROJECT
// =====================================================

const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      visibility,
      technologies,
      deadline,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required.",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || "",
      status: status || "planning",
      visibility: visibility || "private",
      technologies: Array.isArray(technologies)
        ? technologies
        : [],
      deadline: deadline || undefined,

      // Logged-in user becomes owner
      owner: req.user._id,

      members: [],
    });

    const populatedProject =
      await Project.findById(project._id)
        .populate(
          "owner",
          "firstName lastName email role profilePic"
        )
        .populate(
          "members.user",
          "firstName lastName email role profilePic"
        );

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project: populatedProject,
    });
  } catch (error) {
    console.error(
      "Create project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create project.",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL ACCESSIBLE PROJECTS
// =====================================================

const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(
      "=========================================="
    );
    console.log(
      "GET PROJECTS"
    );
    console.log(
      "Authenticated User:",
      userId
    );

    // -----------------------------------------
    // Projects owned by user
    // -----------------------------------------

    const ownedProjects =
      await Project.find({
        owner: userId,
      })
        .populate(
          "owner",
          "firstName lastName email role profilePic"
        )
        .populate(
          "members.user",
          "firstName lastName email role profilePic"
        )
        .sort({
          createdAt: -1,
        });

    console.log(
      "Owned projects:",
      ownedProjects.length
    );

    // -----------------------------------------
    // Projects where user is a member
    // -----------------------------------------

    const memberProjects =
      await Project.find({
        "members.user": userId,
      })
        .populate(
          "owner",
          "firstName lastName email role profilePic"
        )
        .populate(
          "members.user",
          "firstName lastName email role profilePic"
        )
        .sort({
          createdAt: -1,
        });

    console.log(
      "Member projects:",
      memberProjects.length
    );

    // -----------------------------------------
    // Combine without duplicates
    // -----------------------------------------

    const projectMap = new Map();

    ownedProjects.forEach((project) => {
      projectMap.set(
        project._id.toString(),
        project
      );
    });

    memberProjects.forEach((project) => {
      projectMap.set(
        project._id.toString(),
        project
      );
    });

    const projects = Array.from(
      projectMap.values()
    );

    console.log(
      "Total accessible projects:",
      projects.length
    );

    console.log(
      "Projects:",
      projects.map((project) => ({
        id: project._id,
        name: project.name,
      }))
    );

    console.log(
      "=========================================="
    );

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(
      "Get projects error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects.",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE PROJECT
// =====================================================

const getProjectById = async (req, res) => {
  try {
    const project =
      await Project.findOne({
        _id: req.params.id,

        $or: [
          {
            owner: req.user._id,
          },
          {
            "members.user": req.user._id,
          },
        ],
      })
        .populate(
          "owner",
          "firstName lastName email role profilePic"
        )
        .populate(
          "members.user",
          "firstName lastName email role profilePic"
        );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you do not have access.",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(
      "Get project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE PROJECT
// OWNER ONLY
// =====================================================

const updateProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      visibility,
      technologies,
      deadline,
      progress,
    } = req.body;

    const project =
      await Project.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you are not the owner.",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Project name cannot be empty.",
        });
      }

      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (status !== undefined) {
      project.status = status;
    }

    if (visibility !== undefined) {
      project.visibility = visibility;
    }

    if (technologies !== undefined) {
      project.technologies =
        Array.isArray(technologies)
          ? technologies
          : [];
    }

    if (deadline !== undefined) {
      project.deadline = deadline;
    }

    if (progress !== undefined) {
      project.progress = progress;
    }

    await project.save();

    const updatedProject =
      await Project.findById(project._id)
        .populate(
          "owner",
          "firstName lastName email role profilePic"
        )
        .populate(
          "members.user",
          "firstName lastName email role profilePic"
        );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    console.error(
      "Update project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update project.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE PROJECT
// OWNER ONLY
// =====================================================

const deleteProject = async (req, res) => {
  try {
    const project =
      await Project.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you are not the owner.",
      });
    }

    await Project.findByIdAndDelete(
      project._id
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete project.",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};