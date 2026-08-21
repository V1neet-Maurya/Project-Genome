import mongoose from "mongoose";

const teamWorkloadSchema =
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

      members: [
        {
          member: {
            type:
              mongoose.Schema.Types.ObjectId,
            ref: "User",
          },

          totalTasks: Number,
          completedTasks: Number,
          activeTasks: Number,
          overdueTasks: Number,
          blockedTasks: Number,
          highPriorityTasks: Number,

          workloadScore: Number,

          workloadLevel: String,
        },
      ],

      aiSummary: {
        type: String,
        default: "",
      },

      aiRecommendations: [
        {
          title: String,
          priority: String,
          reason: String,
        },
      ],
    },
    {
      timestamps: true,
    }
  );

const TeamWorkload =
  mongoose.model(
    "TeamWorkload",
    teamWorkloadSchema
  );

export default TeamWorkload;