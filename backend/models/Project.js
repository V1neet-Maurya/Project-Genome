import mongoose from "mongoose";

const projectSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      members: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },

          role: {
            type: String,
            enum: [
              "admin",
              "developer",
              "viewer",
            ],
            default: "developer",
          },

          joinedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      status: {
        type: String,
        enum: [
          "planning",
          "active",
          "completed",
          "on-hold",
        ],
        default: "planning",
      },

      visibility: {
        type: String,
        enum: [
          "private",
          "public",
        ],
        default: "private",
      },

      technologies: [
        {
          type: String,
          trim: true,
        },
      ],

      deadline: {
        type: Date,
      },

      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

const Project =
  mongoose.model(
    "Project",
    projectSchema
  );

export default Project;