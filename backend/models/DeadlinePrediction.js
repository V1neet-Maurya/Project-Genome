import mongoose from "mongoose";

const deadlinePredictionSchema =
  new mongoose.Schema(
    {
      project: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },

      predictedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      originalDeadline: {
        type: Date,
        default: null,
      },

      predictedCompletionDate: {
        type: Date,
        default: null,
      },

      delayDays: {
        type: Number,
        default: 0,
      },

      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      riskLevel: {
        type: String,
        enum: [
          "low",
          "medium",
          "high",
          "critical",
        ],
        default: "low",
      },

      status: {
        type: String,
        enum: [
          "on-track",
          "at-risk",
          "delayed",
        ],
        default: "on-track",
      },

      reason: {
        type: String,
        default: "",
      },

      recommendations: [
        String,
      ],
    },
    {
      timestamps: true,
    }
  );

const DeadlinePrediction =
  mongoose.model(
    "DeadlinePrediction",
    deadlinePredictionSchema
  );

export default DeadlinePrediction;