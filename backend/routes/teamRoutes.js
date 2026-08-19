import express from "express";

import {
  getProjectMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from "../controllers/teamController.js";

import protect from "../middleware/authMiddleware.js";
import projectAccess from "../middleware/projectAccess.js";
import roleAccess from "../middleware/roleAccess.js";

const router =
  express.Router();

// =====================================================
// GET MEMBERS
// Any project member
// =====================================================

router.get(
  "/:projectId",
  protect,
  projectAccess,
  getProjectMembers
);

// =====================================================
// ADD MEMBER
// Owner + Admin
// =====================================================

router.post(
  "/:projectId",
  protect,
  projectAccess,
  roleAccess("owner", "admin"),
  addMember
);

// =====================================================
// UPDATE ROLE
// Owner + Admin
// =====================================================

router.put(
  "/:projectId/:userId",
  protect,
  projectAccess,
  roleAccess("owner", "admin"),
  updateMemberRole
);

// =====================================================
// REMOVE MEMBER
// Owner + Admin
// =====================================================

router.delete(
  "/:projectId/:userId",
  protect,
  projectAccess,
  roleAccess("owner", "admin"),
  removeMember
);

export default router;