import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },

      type: {
        type: String,
        enum: [
          "task",
          "issue",
          "team",
          "document",
          "project",
          "system",
        ],
        default: "system",
      },

      title: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      read: {
        type: Boolean,
        default: false,
      },

      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    {
      timestamps: true,
    }
  );

const Notification =
  mongoose.model(
    "Notification",
    notificationSchema
  );

export default Notification;