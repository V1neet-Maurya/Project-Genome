import { Router } from "express";

import {
  login,
  register,
  getCurrentUser,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = Router();

// Register
router.post(
  "/register",
  register
);

// Login
router.post(
  "/login",
  login
);

// Restore user after refresh
router.get(
  "/me",
  protect,
  getCurrentUser
);

export default router;