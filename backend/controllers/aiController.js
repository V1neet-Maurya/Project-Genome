import buildProjectContext from "../services/ai/projectContext.js";
import askGenome from "../services/ai/aiService.js";

export const askProjectAI = async (
  req,
  res,
  next
) => {
  try {
    const {
      projectId,
      question,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const context =
      await buildProjectContext(
        projectId,
        req.user._id
      );

    const answer =
      await askGenome({
        question,
        context,
      });

    return res.status(200).json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    next(error);
  }
};