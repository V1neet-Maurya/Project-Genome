import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  generateProjectSummaryController,
} from "../controllers/projectSummaryController.js";

const router =
  express.Router();

router.post(
  "/project/:projectId",
  protect,
  generateProjectSummaryController
);

export default router;