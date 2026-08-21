import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  generateProjectRisk,
} from "../controllers/projectRiskController.js";

const router =
  express.Router();

router.post(
  "/project/:projectId",
  protect,
  generateProjectRisk
);

export default router;