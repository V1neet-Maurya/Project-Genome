import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  predictProjectDeadline,
} from "../controllers/deadlinePredictionController.js";

const router = express.Router();

// =====================================================
// PREDICT PROJECT DEADLINE
// =====================================================

router.post(
  "/project/:projectId",
  protect,
  predictProjectDeadline
);

export default router;