import express from "express";

import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
} from "../controllers/documentController.js";

import protect from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router =
  express.Router();

// =====================================================
// UPLOAD DOCUMENT
// =====================================================

router.post(
  "/",
  protect,
  upload.single("file"),
  uploadDocument
);

// =====================================================
// GET ALL DOCUMENTS
// =====================================================

router.get(
  "/",
  protect,
  getDocuments
);

// =====================================================
// GET SINGLE DOCUMENT
// =====================================================

router.get(
  "/:id",
  protect,
  getDocumentById
);

// =====================================================
// DELETE DOCUMENT
// =====================================================

router.delete(
  "/:id",
  protect,
  deleteDocument
);

export default router;