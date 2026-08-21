import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  generateTeamWorkload,
} from "../controllers/workloadController.js";

const router =
  express.Router();

router.post(
  "/project/:projectId",
  protect,
  generateTeamWorkload
);

export default router;