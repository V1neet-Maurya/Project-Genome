import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  askProjectAI,
} from "../controllers/aiController.js";

const router = express.Router();

router.post(
  "/ask",
  protect,
  askProjectAI
);

export default router;