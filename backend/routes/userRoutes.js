import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  updateProfilePicture,
  deleteMyAccount,
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

import validate from "../middleware/validate.js";

import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "../validations/userValidation.js";

const router = express.Router();

// =====================================================
// GET LOGGED-IN USER'S PROFILE
// =====================================================

router.get(
  "/profile",
  protect,
  getMyProfile
);

// =====================================================
// UPDATE LOGGED-IN USER'S PROFILE
// =====================================================

router.put(
  "/profile",
  protect,
  validate(updateProfileSchema),
  updateMyProfile
);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  changePassword
);

// =====================================================
// UPDATE PROFILE PICTURE
// =====================================================

router.put(
  "/profile-picture",
  protect,
  upload.single("file"),
  updateProfilePicture
);

// =====================================================
// DELETE MY ACCOUNT
// =====================================================

router.delete(
  "/account",
  protect,
  validate(deleteAccountSchema),
  deleteMyAccount
);

export default router;