import fs from "fs";
import path from "path";

const MAX_FILE_LINES = 500;
const MAX_FUNCTION_LINES = 100;
const MAX_NESTING = 4;

const sourceExtensions = new Set([
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
]);

const createFinding = ({
  severity = "medium",
  title,
  description,
  file,
  line = null,
  suggestion,
}) => {
  return {
    category: "quality",
    severity,
    title,
    description,
    file,
    line,
    suggestion,
  };
};

const analyzeFile = (
  projectDirectory,
  relativeFile
) => {
  const fullPath = path.join(
    projectDirectory,
    relativeFile
  );

  const findings = [];

  let content;

  try {
    content = fs.readFileSync(
      fullPath,
      "utf8"
    );
  } catch {
    return findings;
  }

  const lines = content.split("\n");

  // ---------------------------------------------
  // 1. Very large file
  // ---------------------------------------------

  if (lines.length > MAX_FILE_LINES) {
    findings.push(
      createFinding({
        severity: "medium",

        title: "Large source file",

        description:
          `This file contains ${lines.length} lines of code.`,

        file: relativeFile,

        suggestion:
          "Consider splitting this file into smaller modules.",
      })
    );
  }

  // ---------------------------------------------
  // 2. console.log detection
  // ---------------------------------------------

  lines.forEach(
    (lineContent, index) => {
      if (
        /\bconsole\.log\s*\(/.test(
          lineContent
        )
      ) {
        findings.push(
          createFinding({
            severity: "low",

            title:
              "Console logging found",

            description:
              "A console.log statement was found in the source code.",

            file: relativeFile,

            line: index + 1,

            suggestion:
              "Remove debugging logs or replace them with a structured logging system.",
          })
        );
      }
    }
  );

  // ---------------------------------------------
  // 3. TODO / FIXME detection
  // ---------------------------------------------

  lines.forEach(
    (lineContent, index) => {
      if (
        /\b(TODO|FIXME)\b/i.test(
          lineContent
        )
      ) {
        findings.push(
          createFinding({
            severity: "low",

            title:
              "Pending TODO/FIXME found",

            description:
              "The source contains an unfinished TODO or FIXME item.",

            file: relativeFile,

            line: index + 1,

            suggestion:
              "Resolve the TODO/FIXME or convert it into a tracked Genome task or issue.",
          })
        );
      }
    }
  );

  // ---------------------------------------------
  // 4. Very long lines
  // ---------------------------------------------

  lines.forEach(
    (lineContent, index) => {
      if (lineContent.length > 150) {
        findings.push(
          createFinding({
            severity: "low",

            title:
              "Very long line",

            description:
              `This line contains ${lineContent.length} characters.`,

            file: relativeFile,

            line: index + 1,

            suggestion:
              "Break long expressions into smaller readable sections.",
          })
        );
      }
    }
  );

  // ---------------------------------------------
  // 5. Basic nesting detection
  // ---------------------------------------------

  let currentDepth = 0;
  let maxDepth = 0;
  let maxDepthLine = 1;

  lines.forEach(
    (lineContent, index) => {
      const opening =
        (
          lineContent.match(
            /[{([]/g
          ) || []
        ).length;

      const closing =
        (
          lineContent.match(
            /[}\])]/g
          ) || []
        ).length;

      currentDepth +=
        opening - closing;

      if (
        currentDepth > maxDepth
      ) {
        maxDepth =
          currentDepth;

        maxDepthLine =
          index + 1;
      }
    }
  );

  if (maxDepth > MAX_NESTING) {
    findings.push(
      createFinding({
        severity: "medium",

        title:
          "Deep nesting detected",

        description:
          `The code reaches an estimated nesting depth of ${maxDepth}.`,

        file: relativeFile,

        line: maxDepthLine,

        suggestion:
          "Reduce nesting by extracting functions, using guard clauses, or simplifying conditional logic.",
      })
    );
  }

  return findings;
};

export const analyzeCodeQuality = (
  projectDirectory,
  files
) => {
  const findings = [];

  for (const file of files) {
    if (
      !sourceExtensions.has(
        path.extname(file.path)
          .toLowerCase()
      )
    ) {
      continue;
    }

    findings.push(
      ...analyzeFile(
        projectDirectory,
        file.path
      )
    );
  }

  return findings;
};