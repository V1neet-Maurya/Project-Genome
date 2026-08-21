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

// =====================================================
// CREATE PROJECT
// =====================================================

router.post(
  "/",
  authMiddleware,
  validate(createProjectSchema),
  createProject
);

// =====================================================
// GET ALL ACCESSIBLE PROJECTS
// =====================================================

router.get(
  "/",
  authMiddleware,
  getProjects
);

// =====================================================
// GET SINGLE PROJECT
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  getProjectById
);

// =====================================================
// UPDATE PROJECT
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  validate(updateProjectSchema),
  updateProject
);

// =====================================================
// DELETE PROJECT
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteProject
);

export default router;