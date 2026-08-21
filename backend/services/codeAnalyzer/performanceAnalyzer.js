import fs from "fs";
import path from "path";

const sourceExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".go",
  ".c",
  ".cpp",
  ".cs",
]);

// ==========================================
// CREATE FINDING
// ==========================================

const createFinding = ({
  severity = "low",
  title,
  description,
  file,
  line = null,
  suggestion,
}) => {
  return {
    category: "performance",
    severity,
    title,
    description,
    file,
    line,
    suggestion,
  };
};

// ==========================================
// ANALYZE SINGLE FILE
// ==========================================

const analyzeFile = (
  projectDirectory,
  relativeFile
) => {
  const findings = [];

  const fullPath = path.join(
    projectDirectory,
    relativeFile
  );

  let content;

  try {
    content = fs.readFileSync(
      fullPath,
      "utf8"
    );
  } catch {
    return findings;
  }

  const lines = content.split(/\r?\n/);

  // ==========================================
  // 1. VERY LARGE SOURCE FILE
  // ==========================================

  if (lines.length > 1000) {
    findings.push(
      createFinding({
        severity: "medium",

        title:
          "Very large source file",

        description:
          `The file contains ${lines.length} lines.`,

        file: relativeFile,

        suggestion:
          "Split the file into smaller modules to improve maintainability and reduce complexity.",
      })
    );
  }

  // ==========================================
  // 2. POTENTIAL NESTED LOOPS
  // ==========================================

  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    const current =
      lines[i];

    if (
      /\b(for|while)\s*\(/.test(
        current
      )
    ) {
      const nextLines =
        lines
          .slice(i + 1, i + 30)
          .join("\n");

      if (
        /\b(for|while)\s*\(/.test(
          nextLines
        )
      ) {
        findings.push(
          createFinding({
            severity: "medium",

            title:
              "Potential nested loop",

            description:
              "Nested iteration may result in higher algorithmic complexity.",

            file: relativeFile,

            line: i + 1,

            suggestion:
              "Check whether the nested loop can be optimized using maps, sets, indexing, or a more efficient algorithm.",
          })
        );
      }
    }
  }

  // ==========================================
  // 3. SYNCHRONOUS FILESYSTEM OPERATIONS
  // ==========================================

  lines.forEach(
    (line, index) => {
      if (
        /fs\.(readFileSync|writeFileSync|appendFileSync|readdirSync|statSync)\s*\(/.test(
          line
        )
      ) {
        findings.push(
          createFinding({
            severity: "medium",

            title:
              "Synchronous filesystem operation",

            description:
              "A synchronous filesystem operation was detected.",

            file: relativeFile,

            line: index + 1,

            suggestion:
              "For server-side applications, consider asynchronous filesystem APIs when blocking the event loop could affect throughput.",
          })
        );
      }
    }
  );

  // ==========================================
  // 4. JSON.PARSE
  // ==========================================

  lines.forEach(
    (line, index) => {
      if (
        /JSON\.parse\s*\(/.test(
          line
        )
      ) {
        findings.push(
          createFinding({
            severity: "info",

            title:
              "JSON parsing detected",

            description:
              "JSON.parse() was detected. Large payloads can make parsing expensive.",

            file: relativeFile,

            line: index + 1,

            suggestion:
              "Avoid repeatedly parsing large JSON payloads inside frequently executed code.",
          })
        );
      }
    }
  );

  // ==========================================
  // 5. POTENTIAL DATABASE QUERY INSIDE LOOP
  // ==========================================

  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    const current =
      lines[i];

    if (
      /\b(for|while|forEach|map)\b/.test(
        current
      )
    ) {
      const nextLines =
        lines
          .slice(i, i + 40)
          .join("\n");

      if (
        /\.(find|findOne|findById|aggregate|updateOne|deleteOne)\s*\(/.test(
          nextLines
        )
      ) {
        findings.push(
          createFinding({
            severity: "high",

            title:
              "Potential database query inside loop",

            description:
              "A database operation appears to occur inside an iteration block. This can lead to N+1 query patterns.",

            file: relativeFile,

            line: i + 1,

            suggestion:
              "Consider batching queries, using aggregation, populating related data, or fetching the required records before iteration.",
          })
        );
      }
    }
  }

  // ==========================================
  // 6. POTENTIAL UNBOUNDED DATABASE QUERY
  // ==========================================

  const hasFind =
    /\.find\s*\(/.test(
      content
    );

  const hasPagination =
    /(\.limit\s*\(|\.skip\s*\(|page|pageSize|limit|offset)/i.test(
      content
    );

  if (
    hasFind &&
    !hasPagination
  ) {
    findings.push(
      createFinding({
        severity: "low",

        title:
          "Potential unbounded database query",

        description:
          "A database find operation was detected without an obvious pagination mechanism in the same file.",

        file: relativeFile,

        suggestion:
          "For large collections, consider pagination or a result limit.",
      })
    );
  }

  return findings;
};

// ==========================================
// MAIN PERFORMANCE ANALYZER
// ==========================================

export const analyzePerformance = (
  projectDirectory,
  files = []
) => {
  const findings = [];

  for (const file of files) {
    if (!file?.path) {
      continue;
    }

    const extension =
      path
        .extname(file.path)
        .toLowerCase();

    if (
      !sourceExtensions.has(
        extension
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

  // ==========================================
  // CALCULATE PERFORMANCE SCORE
  // ==========================================

  let score = 100;

  for (const finding of findings) {
    if (
      finding.severity ===
      "critical"
    ) {
      score -= 20;
    } else if (
      finding.severity ===
      "high"
    ) {
      score -= 10;
    } else if (
      finding.severity ===
      "medium"
    ) {
      score -= 5;
    } else if (
      finding.severity ===
      "low"
    ) {
      score -= 2;
    }
  }

  score = Math.max(
    0,
    Math.min(
      100,
      score
    )
  );

  return {
    score,
    findings,
  };
};