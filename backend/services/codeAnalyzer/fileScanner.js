import fs from "fs";
import path from "path";

// ==========================================
// GENOME CODELAB FILE SCANNER
// ==========================================

// Directories that should never be analyzed
const ignoredDirectories = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".vite",
  ".cache",
  ".temp",
]);

// Sensitive files that must never be analyzed
// Keep .env.example allowed.
const ignoredFiles = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
]);

const isIgnoredDirectory = (directoryName) => {
  return ignoredDirectories.has(
    directoryName.toLowerCase()
  );
};

const isIgnoredFile = (fileName) => {
  return ignoredFiles.has(
    fileName.toLowerCase()
  );
};

const countLines = (content) => {
  if (!content) {
    return 0;
  }

  return content.split(/\r?\n/).length;
};

const detectLanguage = (filePath) => {
  const extension = path
    .extname(filePath)
    .toLowerCase();

  const languageMap = {
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".py": "Python",
    ".java": "Java",
    ".c": "C",
    ".h": "C",
    ".cpp": "C++",
    ".cc": "C++",
    ".cxx": "C++",
    ".cs": "C#",
    ".go": "Go",
    ".rs": "Rust",
    ".php": "PHP",
    ".rb": "Ruby",
    ".swift": "Swift",
    ".kt": "Kotlin",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".json": "JSON",
    ".md": "Markdown",
  };

  return languageMap[extension] || "Other";
};

const scanDirectory = (
  directory,
  rootDirectory,
  files
) => {
  let entries;

  try {
    entries = fs.readdirSync(
      directory,
      {
        withFileTypes: true,
      }
    );
  } catch (error) {
    console.error(
      `Unable to read directory ${directory}:`,
      error
    );

    return;
  }

  for (const entry of entries) {
    const entryName = entry.name;

    // ========================================
    // IGNORE DIRECTORIES
    // ========================================

    if (
      entry.isDirectory() &&
      isIgnoredDirectory(entryName)
    ) {
      continue;
    }

    // ========================================
    // IGNORE SENSITIVE FILES
    // ========================================

    if (
      entry.isFile() &&
      isIgnoredFile(entryName)
    ) {
      continue;
    }

    const fullPath = path.join(
      directory,
      entryName
    );

    // ========================================
    // DIRECTORY
    // ========================================

    if (entry.isDirectory()) {
      scanDirectory(
        fullPath,
        rootDirectory,
        files
      );

      continue;
    }

    // ========================================
    // FILE
    // ========================================

    if (!entry.isFile()) {
      continue;
    }

    const relativePath = path.relative(
      rootDirectory,
      fullPath
    );

    const normalizedPath =
      relativePath.replace(
        /\\/g,
        "/"
      );

    const language =
      detectLanguage(
        normalizedPath
      );

    let content = "";
    let lines = 0;

    // ========================================
    // READ FILE
    // ========================================

    try {
      content = fs.readFileSync(
        fullPath,
        "utf8"
      );

      lines = countLines(content);
    } catch (error) {
      console.warn(
        `Unable to read file ${normalizedPath}`
      );
    }

    files.push({
      path: normalizedPath,
      language,
      lines,
      size: fs.statSync(fullPath).size,
      content,
    });
  }
};

export const scanProject = (
  projectDirectory
) => {
  const files = [];

  scanDirectory(
    projectDirectory,
    projectDirectory,
    files
  );

  // ==========================================
  // LANGUAGE STATISTICS
  // ==========================================

  const languageMap = {};

  for (const file of files) {
    if (!languageMap[file.language]) {
      languageMap[file.language] = {
        name: file.language,
        files: 0,
        lines: 0,
      };
    }

    languageMap[file.language].files += 1;
    languageMap[file.language].lines +=
      file.lines;
  }

  const languages =
    Object.values(languageMap);

  // ==========================================
  // TOTAL LINES
  // ==========================================

  const totalLines = files.reduce(
    (total, file) =>
      total + file.lines,
    0
  );

  return {
    files,
    totalFiles: files.length,
    totalLines,
    languages,
  };
};