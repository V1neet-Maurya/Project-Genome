import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  askAssistant,
} from "../controllers/assistantController.js";

const router = express.Router();

// =====================================================
// GENOME AI ASSISTANT
// =====================================================

router.post(
  "/project/:projectId",
  protect,
  askAssistant
);

export default router;