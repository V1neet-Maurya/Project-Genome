import { Router } from "express";

import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

import { protect } from "../middleware/auth.js";

import projectAccess from "../middleware/projectAccess.js";

import roleAccess from "../middleware/roleAccess.js";

import validate from "../middleware/validate.js";

import {
  createTaskSchema,
  updateTaskSchema,
} from "../validations/taskValidation.js";

const router = Router();

// =====================================================
// ALL TASK ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(protect);

// =====================================================
// CREATE TASK
// Owner + Admin + Developer
// =====================================================

router.post(
  "/",
  validate(createTaskSchema),
  projectAccess,
  roleAccess("owner", "admin", "developer"),
  createTask
);

// =====================================================
// GET ALL TASKS
// =====================================================

router.get(
  "/",
  getTasks
);

// =====================================================
// GET SINGLE TASK
// =====================================================

router.get(
  "/:id",
  getTask
);

// =====================================================
// UPDATE TASK
// =====================================================

router.put(
  "/:id",
  validate(updateTaskSchema),
  updateTask
);

// =====================================================
// DELETE TASK
// =====================================================

router.delete(
  "/:id",
  deleteTask
);

export default router;