import fs from "fs";
import path from "path";

// ==========================================
// CREATE FINDING
// ==========================================

const createFinding = ({
  severity = "low",
  title,
  description,
  file = null,
  suggestion,
}) => {
  return {
    category: "documentation",
    severity,
    title,
    description,
    file,
    suggestion,
  };
};

// ==========================================
// FIND FILE
// ==========================================

const findFile = (directory, fileName) => {
  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "dist" ||
      entry.name === "build"
    ) {
      continue;
    }

    const fullPath = path.join(
      directory,
      entry.name
    );

    if (
      entry.isFile() &&
      entry.name.toLowerCase() ===
        fileName.toLowerCase()
    ) {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const result = findFile(
        fullPath,
        fileName
      );

      if (result) {
        return result;
      }
    }
  }

  return null;
};

// ==========================================
// COUNT COMMENTS
// ==========================================

const countComments = (
  content,
  extension
) => {
  if (
    [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".java",
      ".c",
      ".cpp",
      ".cs",
      ".go",
    ].includes(extension)
  ) {
    const singleLine =
      (
        content.match(/\/\/.*/g) || []
      ).length;

    const multiLine =
      (
        content.match(
          /\/\*[\s\S]*?\*\//
        ) || []
      ).length;

    return (
      singleLine +
      multiLine
    );
  }

  if (extension === ".py") {
    return (
      content.match(
        /^\s*#/gm
      ) || []
    ).length;
  }

  return 0;
};

// ==========================================
// DOCUMENTATION ANALYZER
// ==========================================

export const analyzeDocumentation = (
  projectDirectory,
  files
) => {
  const findings = [];

  let score = 100;

  // =========================================
  // README
  // =========================================

  const readme =
    findFile(
      projectDirectory,
      "README.md"
    );

  if (!readme) {
    findings.push(
      createFinding({
        severity: "high",
        title:
          "README not found",
        description:
          "The project does not contain a README.md file.",
        suggestion:
          "Add a README explaining the project, setup process, usage, architecture, and important commands.",
      })
    );

    score -= 20;
  } else {
    const content =
      fs.readFileSync(
        readme,
        "utf8"
      );

    const readmeFile =
      path.relative(
        projectDirectory,
        readme
      );

    // =========================================
    // README SIZE
    // =========================================

    if (
      content.trim().length <
      300
    ) {
      findings.push(
        createFinding({
          severity: "medium",
          title:
            "README contains limited documentation",
          description:
            "The README exists but contains relatively little information.",
          file: readmeFile,
          suggestion:
            "Add project overview, installation instructions, usage examples, configuration, and architecture details.",
        })
      );

      score -= 8;
    }

    // =========================================
    // INSTALLATION INFORMATION
    // =========================================

    if (
      !/(install|installation|setup|getting started)/i.test(
        content
      )
    ) {
      findings.push(
        createFinding({
          severity: "medium",
          title:
            "Installation instructions not detected",
          description:
            "The README does not appear to contain setup or installation instructions.",
          file: readmeFile,
          suggestion:
            "Document how a new developer can install dependencies and start the application.",
        })
      );

      score -= 6;
    }

    // =========================================
    // USAGE
    // =========================================

    if (
      !/(usage|run|start|npm run|example)/i.test(
        content
      )
    ) {
      findings.push(
        createFinding({
          severity: "low",
          title:
            "Usage instructions not detected",
          description:
            "The README does not clearly describe how to use or run the project.",
          file: readmeFile,
          suggestion:
            "Add commands and examples showing how to run and use the application.",
        })
      );

      score -= 4;
    }
  }

  // =========================================
  // ENVIRONMENT DOCUMENTATION
  // =========================================

  const envExample =
    findFile(
      projectDirectory,
      ".env.example"
    );

  const envSample =
    findFile(
      projectDirectory,
      ".env.sample"
    );

  if (
    !envExample &&
    !envSample
  ) {
    findings.push(
      createFinding({
        severity: "medium",
        title:
          "Environment example file not detected",
        description:
          "No .env.example or .env.sample file was found.",
        suggestion:
          "Provide an example environment configuration without exposing real secrets.",
      })
    );

    score -= 8;
  }

  // =========================================
  // SOURCE CODE COMMENTS
  // =========================================

  let sourceFiles = 0;
  let filesWithComments = 0;

  for (const file of files) {
    const extension =
      path.extname(
        file.path
      ).toLowerCase();

    if (
      ![
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".py",
        ".java",
        ".c",
        ".cpp",
        ".cs",
        ".go",
      ].includes(extension)
    ) {
      continue;
    }

    sourceFiles++;

    const fullPath =
      path.join(
        projectDirectory,
        file.path
      );

    try {
      const content =
        fs.readFileSync(
          fullPath,
          "utf8"
        );

      const comments =
        countComments(
          content,
          extension
        );

      if (comments > 0) {
        filesWithComments++;
      }
    } catch {
      // Ignore unreadable files
    }
  }

  // =========================================
  // COMMENT RATIO
  // =========================================

  if (
    sourceFiles > 0
  ) {
    const commentRatio =
      filesWithComments /
      sourceFiles;

    if (
      commentRatio < 0.1
    ) {
      findings.push(
        createFinding({
          severity: "low",
          title:
            "Limited source documentation",
          description:
            "Very few source files contain comments.",
          suggestion:
            "Document complex business logic and non-obvious implementation decisions.",
        })
      );

      score -= 5;
    }
  }

  // =========================================
  // API DOCUMENTATION
  // =========================================

  const apiFiles =
    files.filter(
      (file) =>
        /swagger|openapi|api-doc|postman/i.test(
          file.path
        )
    );

  if (
    apiFiles.length === 0
  ) {
    findings.push(
      createFinding({
        severity: "low",
        title:
          "API documentation not detected",
        description:
          "No obvious Swagger, OpenAPI, or API documentation files were detected.",
        suggestion:
          "Consider documenting backend APIs with OpenAPI/Swagger or another consistent API documentation format.",
      })
    );

    score -= 3;
  }

  // =========================================
  // FINAL SCORE
  // =========================================

  score = Math.max(
    0,
    Math.min(
      100,
      score
    )
  );

  // =========================================
  // COMMENT PERCENTAGE
  // =========================================

  const commentPercentage =
    sourceFiles > 0
      ? Math.round(
          (filesWithComments /
            sourceFiles) *
            100
        )
      : 0;

  // =========================================
  // FINAL RESULT
  // =========================================

  return {
    score,

    sourceFiles,

    filesWithComments,

    commentPercentage,

    readmeFound:
      Boolean(readme),

    environmentDocumentation:
      Boolean(
        envExample ||
        envSample
      ),

    apiDocumentation:
      apiFiles.length > 0,

    findings,
  };
};