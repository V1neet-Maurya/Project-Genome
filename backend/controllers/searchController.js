import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Issue from "../models/Issue.js";
import Document from "../models/Document.js";

export const globalSearch = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;
    const search = req.query.q?.trim();

    // =====================================================
    // EMPTY SEARCH
    // =====================================================

    if (!search) {
      return res.status(200).json({
        success: true,
        data: {
          projects: [],
          tasks: [],
          issues: [],
          documents: [],
        },
      });
    }

    // =====================================================
    // PROJECTS USER CAN ACCESS
    // OWNER OR MEMBER
    // =====================================================

    const accessibleProjects =
      await Project.find({
        $or: [
          {
            owner: userId,
          },
          {
            "members.user": userId,
          },
        ],
      }).select("_id");

    const projectIds =
      accessibleProjects.map(
        (project) => project._id
      );

    // =====================================================
    // SEARCH PROJECTS
    // =====================================================

    const projects =
      await Project.find({
        _id: {
          $in: projectIds,
        },

        name: {
          $regex: search,
          $options: "i",
        },
      })
        .select(
          "_id name description"
        )
        .limit(10);

    // =====================================================
    // SEARCH TASKS
    // =====================================================

    const tasks =
      await Task.find({
        project: {
          $in: projectIds,
        },

        $or: [
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          {
            description: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      })
        .populate(
          "project",
          "name"
        )
        .select(
          "_id title description status priority project"
        )
        .limit(10);

    // =====================================================
    // SEARCH ISSUES
    // =====================================================

    const issues =
      await Issue.find({
        project: {
          $in: projectIds,
        },

        $or: [
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          {
            description: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      })
        .populate(
          "project",
          "name"
        )
        .select(
          "_id title description status priority project"
        )
        .limit(10);

    // =====================================================
    // SEARCH DOCUMENTS
    // =====================================================

    const documents =
      await Document.find({
        project: {
          $in: projectIds,
        },

        $or: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            originalName: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      })
        .populate(
          "project",
          "name"
        )
        .select(
          "_id name originalName fileUrl fileType project"
        )
        .limit(10);

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      data: {
        projects,
        tasks,
        issues,
        documents,
      },
    });
  } catch (error) {
    console.error(
      "Global search error:",
      error
    );

    next(error);
  }
};