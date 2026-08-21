import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  generateProjectPlanController,
} from "../controllers/projectPlannerController.js";

const router =
  express.Router();

router.post(
  "/project/:projectId",
  protect,
  generateProjectPlanController
);

export default router;