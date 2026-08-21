import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  createTaskFromAI,
  createIssueFromAI,
} from "../controllers/aiActionController.js";

const router = express.Router();

// ==========================================
// CREATE TASK FROM AI RECOMMENDATION
// ==========================================

router.post(
  "/create-task",
  protect,
  createTaskFromAI
);

// ==========================================
// CREATE ISSUE FROM CODELAB FINDING
// ==========================================

router.post(
  "/create-issue",
  protect,
  createIssueFromAI
);

export default router;