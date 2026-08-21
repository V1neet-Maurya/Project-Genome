import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  generateTaskPlanController,
  acceptAIPlan,
} from "../controllers/taskGenerationController.js";

const router = express.Router();

// =====================================================
// GENERATE AI TASK PLAN
// =====================================================

router.post(
  "/project/:projectId",
  protect,
  generateTaskPlanController
);

// =====================================================
// ACCEPT AI TASK PLAN
// =====================================================

router.post(
  "/accept",
  protect,
  acceptAIPlan
);

export default router;