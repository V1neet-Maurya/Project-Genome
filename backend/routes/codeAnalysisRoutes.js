import express from "express";

import protect from "../middleware/authMiddleware.js";

import codeUpload from "../middleware/codeUploadMiddleware.js";

import {
  uploadAndAnalyzeProject,
  getCodeAnalyses,
  getCodeAnalysisById,
  getProjectCodeAnalyses,
  deleteCodeAnalysis,
  generateAIReview,
  compareAnalyses,
  generateFixSuggestion,
} from "../controllers/codeAnalysisController.js";

const router = express.Router();

// ==========================================
// UPLOAD AND ANALYZE PROJECT
// ==========================================

router.post(
  "/analyze",
  protect,
  codeUpload.single("projectZip"),
  uploadAndAnalyzeProject
);

// ==========================================
// GET ALL CODE ANALYSES
// ==========================================

router.get(
  "/",
  protect,
  getCodeAnalyses
);

// ==========================================
// GET PROJECT ANALYSIS HISTORY
// ==========================================

router.get(
  "/project/:projectId",
  protect,
  getProjectCodeAnalyses
);

// ==========================================
// COMPARE TWO CODE ANALYSES
// ==========================================

router.post(
  "/compare",
  protect,
  compareAnalyses
);

// ==========================================
// GENERATE AI FIX SUGGESTION
// ==========================================

router.post(
  "/fix-suggestion",
  protect,
  generateFixSuggestion
);

// ==========================================
// GET SINGLE CODE ANALYSIS
// ==========================================

router.get(
  "/:id",
  protect,
  getCodeAnalysisById
);

// ==========================================
// DELETE CODE ANALYSIS
// ==========================================

router.delete(
  "/:id",
  protect,
  deleteCodeAnalysis
);

// ==========================================
// GENERATE AI CODE REVIEW
// ==========================================

router.post(
  "/:id/ai-review",
  protect,
  generateAIReview
);

export default router;