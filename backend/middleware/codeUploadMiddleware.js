import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
  process.cwd(),
  "temp"
);

// =====================================================
// CREATE TEMP DIRECTORY
// =====================================================

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =====================================================
// STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${file.originalname}`;

    cb(null, uniqueName);
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  console.log(
    "=========================================="
  );

  console.log("MULTER FILE RECEIVED");
  console.log("Field name:", file.fieldname);
  console.log("Original name:", file.originalname);
  console.log("Mimetype:", file.mimetype);

  console.log(
    "=========================================="
  );

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (extension !== ".zip") {
    return cb(
      new Error("Only ZIP files are allowed")
    );
  }

  cb(null, true);
};

// =====================================================
// MULTER
// =====================================================

const codeUpload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export default codeUpload;