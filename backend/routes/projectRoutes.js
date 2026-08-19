import express from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import validate from "../middleware/validate.js";

import {
  createProjectSchema,
  updateProjectSchema,
} from "../validations/projectValidation.js";

const router = express.Router();

// CREATE
router.post(
  "/",
  authMiddleware,
  validate(createProjectSchema),
  createProject
);

// GET ALL
router.get(
  "/",
  authMiddleware,
  getProjects
);

// GET ONE
router.get(
  "/:id",
  authMiddleware,
  getProjectById
);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  validate(updateProjectSchema),
  updateProject
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  deleteProject
);

export default router;