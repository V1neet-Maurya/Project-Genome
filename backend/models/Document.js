import mongoose from "mongoose";

const documentSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      originalName: {
        type: String,
        required: true,
      },

      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },

      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      fileUrl: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },

      fileType: {
        type: String,
        default: "file",
      },

      fileSize: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

const Document =
  mongoose.model(
    "Document",
    documentSchema
  );

export default Document;