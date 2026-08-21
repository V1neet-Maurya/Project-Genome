import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  createMilestone,
  getMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
} from "../controllers/milestoneController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createMilestone
);

router.get(
  "/project/:projectId",
  protect,
  getMilestones
);

router.get(
  "/:id",
  protect,
  getMilestoneById
);

router.put(
  "/:id",
  protect,
  updateMilestone
);

router.delete(
  "/:id",
  protect,
  deleteMilestone
);

export default router;