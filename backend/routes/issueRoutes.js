import express from "express";

import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../controllers/issueController.js";

import protect from "../middleware/authMiddleware.js";

import validate from "../middleware/validate.js";

import {
  createIssueSchema,
  updateIssueSchema,
} from "../validations/issueValidation.js";

const router = express.Router();

// =====================================================
// CREATE ISSUE
// =====================================================

router.post(
  "/",
  protect,
  validate(createIssueSchema),
  createIssue
);

// =====================================================
// GET ALL ISSUES
// =====================================================

router.get(
  "/",
  protect,
  getIssues
);

// =====================================================
// GET SINGLE ISSUE
// =====================================================

router.get(
  "/:id",
  protect,
  getIssueById
);

// =====================================================
// UPDATE ISSUE
// =====================================================

router.put(
  "/:id",
  protect,
  validate(updateIssueSchema),
  updateIssue
);

// =====================================================
// DELETE ISSUE
// =====================================================

router.delete(
  "/:id",
  protect,
  deleteIssue
);

export default router;