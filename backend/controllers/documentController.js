import Document from "../models/Document.js";
import Project from "../models/Project.js";
import cloudinary from "../config/cloudinary.js";

// =====================================================
// UPLOAD DOCUMENT
// =====================================================

export const uploadDocument = async (
  req,
  res,
  next
) => {
  try {
    const { project } = req.body;

    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    // ---------------------------------------------
    // CHECK PROJECT
    // Owner OR Member
    // ---------------------------------------------

    const projectExists =
      await Project.findById(project);

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isOwner =
      projectExists.owner.toString() ===
      req.user._id.toString();

    const member =
      projectExists.members?.find(
        (member) =>
          member.user.toString() ===
          req.user._id.toString()
      );

    if (!isOwner && !member) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    // ---------------------------------------------
    // CLOUDINARY RESOURCE TYPE
    // ---------------------------------------------

    const resourceType =
      req.file.mimetype.startsWith("image/")
        ? "image"
        : "raw";

    // ---------------------------------------------
    // UPLOAD TO CLOUDINARY
    // ---------------------------------------------

    const uploadResult = await new Promise(
      (resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: "genome/documents",
              resource_type: resourceType,
            },
            (error, result) => {
              if (error) {
                console.error(
                  "Cloudinary upload error:",
                  error
                );

                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        stream.end(req.file.buffer);
      }
    );

    // ---------------------------------------------
    // CREATE DOCUMENT
    // ---------------------------------------------

    const document =
      await Document.create({
        name: req.file.originalname,

        originalName:
          req.file.originalname,

        project,

        uploadedBy:
          req.user._id,

        fileUrl:
          uploadResult.secure_url,

        publicId:
          uploadResult.public_id,

        fileType:
          req.file.mimetype,

        fileSize:
          req.file.size,
      });

    // ---------------------------------------------
    // POPULATE RESPONSE
    // ---------------------------------------------

    const populatedDocument =
      await Document.findById(
        document._id
      )
        .populate(
          "project",
          "name"
        )
        .populate(
          "uploadedBy",
          "firstName lastName email"
        );

    return res.status(201).json({
      success: true,
      message:
        "Document uploaded successfully",
      data: populatedDocument,
    });
  } catch (error) {
    console.error(
      "Document upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Document upload failed",
      cloudinaryStatus:
        error?.http_code || null,
    });
  }
};

// =====================================================
// GET DOCUMENTS
// Owner OR Member projects
// =====================================================

export const getDocuments = async (
  req,
  res,
  next
) => {
  try {
    // ---------------------------------------------
    // GET PROJECTS USER CAN ACCESS
    // ---------------------------------------------

    const projects =
      await Project.find({
        $or: [
          {
            owner: req.user._id,
          },
          {
            "members.user":
              req.user._id,
          },
        ],
      }).select("_id");

    const projectIds =
      projects.map(
        (project) => project._id
      );

    // ---------------------------------------------
    // GET DOCUMENTS
    // ---------------------------------------------

    const documents =
      await Document.find({
        project: {
          $in: projectIds,
        },
      })
        .populate(
          "project",
          "name"
        )
        .populate(
          "uploadedBy",
          "firstName lastName email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET SINGLE DOCUMENT
// =====================================================

export const getDocumentById =
  async (
    req,
    res,
    next
  ) => {
    try {
      // ---------------------------------------------
      // FIND DOCUMENT
      // ---------------------------------------------

      const document =
        await Document.findById(
          req.params.id
        )
          .populate(
            "project",
            "name owner members"
          )
          .populate(
            "uploadedBy",
            "firstName lastName email"
          );

      if (!document) {
        return res.status(404).json({
          success: false,
          message:
            "Document not found",
        });
      }

      // ---------------------------------------------
      // CHECK PROJECT ACCESS
      // ---------------------------------------------

      const project =
        document.project;

      const isOwner =
        project.owner.toString() ===
        req.user._id.toString();

      const isMember =
        project.members?.some(
          (member) =>
            member.user.toString() ===
            req.user._id.toString()
        );

      if (!isOwner && !isMember) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this document",
        });
      }

      // ---------------------------------------------
      // RESPONSE
      // ---------------------------------------------

      return res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// DELETE DOCUMENT
// =====================================================

export const deleteDocument =
  async (
    req,
    res,
    next
  ) => {
    try {
      // ---------------------------------------------
      // FIND DOCUMENT
      // ---------------------------------------------

      const document =
        await Document.findById(
          req.params.id
        ).populate(
          "project",
          "owner members"
        );

      if (!document) {
        return res.status(404).json({
          success: false,
          message:
            "Document not found",
        });
      }

      // ---------------------------------------------
      // PROJECT
      // ---------------------------------------------

      const project =
        document.project;

      // ---------------------------------------------
      // CHECK OWNER
      // ---------------------------------------------

      const isOwner =
        project.owner.toString() ===
        req.user._id.toString();

      // ---------------------------------------------
      // CHECK MEMBER
      // ---------------------------------------------

      const member =
        project.members?.find(
          (member) =>
            member.user.toString() ===
            req.user._id.toString()
        );

      // ---------------------------------------------
      // CHECK PROJECT ACCESS
      // ---------------------------------------------

      if (!isOwner && !member) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this document",
        });
      }

      // ---------------------------------------------
      // ONLY OWNER / ADMIN CAN DELETE
      // ---------------------------------------------

      if (
        !isOwner &&
        member.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to delete this document",
        });
      }

      // ---------------------------------------------
      // LOGGING
      // ---------------------------------------------

      console.log(
        "Deleting document:",
        document._id
      );

      console.log(
        "Cloudinary public ID:",
        document.publicId
      );

      console.log(
        "Cloudinary file type:",
        document.fileType
      );

      // ---------------------------------------------
      // CLOUDINARY RESOURCE TYPE
      // ---------------------------------------------

      let resourceType = "image";

      if (
        document.fileType?.includes(
          "pdf"
        ) ||
        document.fileType?.includes(
          "zip"
        ) ||
        document.fileType?.includes(
          "rar"
        ) ||
        document.fileType?.includes(
          "msword"
        ) ||
        document.fileType?.includes(
          "officedocument"
        ) ||
        document.fileType?.includes(
          "octet-stream"
        )
      ) {
        resourceType = "raw";
      }

      console.log(
        "Cloudinary resource type:",
        resourceType
      );

      // ---------------------------------------------
      // DELETE FROM CLOUDINARY
      // ---------------------------------------------

      const cloudinaryResult =
        await cloudinary.uploader.destroy(
          document.publicId,
          {
            resource_type:
              resourceType,
            type: "upload",
            invalidate: true,
          }
        );

      console.log(
        "Cloudinary delete result:",
        cloudinaryResult
      );

      // ---------------------------------------------
      // DELETE FROM MONGODB
      // ---------------------------------------------

      await Document.findByIdAndDelete(
        document._id
      );

      console.log(
        "Document deleted from MongoDB"
      );

      // ---------------------------------------------
      // RESPONSE
      // ---------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          "Document deleted successfully",
        data: {
          cloudinary:
            cloudinaryResult,
        },
      });
    } catch (error) {
      console.error(
        "Delete document error:",
        error
      );

      next(error);
    }
  };