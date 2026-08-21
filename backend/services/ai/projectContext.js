import Project from "../../models/Project.js";
import Task from "../../models/Task.js";
import Issue from "../../models/Issue.js";
import Document from "../../models/Document.js";

const buildProjectContext = async (
  projectId,
  userId
) => {
  const project = await Project.findOne({
    _id: projectId,
    owner: userId,
  }).lean();

  if (!project) {
    const error = new Error(
      "Project not found or you do not have access"
    );

    error.statusCode = 404;

    throw error;
  }

  const tasks = await Task.find({
    project: projectId,
  })
    .select(
      "title description status priority assignedTo dueDate"
    )
    .populate(
      "assignedTo",
      "firstName lastName email"
    )
    .lean();

  const issues = await Issue.find({
    project: projectId,
  })
    .select(
      "title description status priority assignedTo"
    )
    .populate(
      "assignedTo",
      "firstName lastName email"
    )
    .lean();

  const documents = await Document.find({
    project: projectId,
  })
    .select(
      "name originalName fileType createdAt"
    )
    .lean();

  return {
    project,
    tasks,
    issues,
    documents,
  };
};

export default buildProjectContext;