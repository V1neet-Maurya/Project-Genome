import mongoose from "mongoose";

const projectRiskSchema =
  new mongoose.Schema(
    {
      project: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },

      analyzedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      overallRisk: {
        score: {
          type: Number,
          default: 0,
        },

        level: {
          type: String,
          enum: [
            "low",
            "medium",
            "high",
            "critical",
          ],
          default: "low",
        },

        summary: {
          type: String,
          default: "",
        },
      },

      risks: [
        {
          title: String,
          severity: String,
          category: String,
          reason: String,
          impact: String,
          recommendation: String,
        },
      ],

      blockers: [
        {
          title: String,
          reason: String,
          impact: String,
        },
      ],

      recommendedActions: [
        {
          title: String,
          priority: String,
          reason: String,
        },
      ],

      projectOutlook: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

const ProjectRisk =
  mongoose.model(
    "ProjectRisk",
    projectRiskSchema
  );

export default ProjectRisk;