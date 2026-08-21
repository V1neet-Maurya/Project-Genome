import fs from "fs";
import path from "path";

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
  ".php",
]);

const createFinding = ({
  severity,
  title,
  description,
  file,
  line,
  suggestion,
}) => ({
  category: "security",
  severity,
  title,
  description,
  file,
  line,
  suggestion,
});

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

  const lines = content.split("\n");

  lines.forEach(
    (lineContent, index) => {
      const line =
        lineContent.trim();

      const lineNumber =
        index + 1;

      // ---------------------------------------
      // MongoDB connection string
      // ---------------------------------------

      if (
        /mongodb(\+srv)?:\/\/[^"'`\s]+/i.test(
          line
        )
      ) {
        findings.push(
          createFinding({
            severity: "critical",

            title:
              "Potential database credential exposure",

            description:
              "A MongoDB connection string appears to be present directly in source code.",

            file: relativeFile,

            line: lineNumber,

            suggestion:
              "Move the database connection string to an environment variable and rotate the exposed credential if it is real.",
          })
        );
      }

      // ---------------------------------------
      // AWS access keys
      // ---------------------------------------

      if (
        /AKIA[0-9A-Z]{16}/.test(
          line
        )
      ) {
        findings.push(
          createFinding({
            severity: "critical",

            title:
              "Potential AWS access key exposure",

            description:
              "The source contains a pattern resembling an AWS access key.",

            file: relativeFile,

            line: lineNumber,

            suggestion:
              "Move credentials to a secure secret manager or environment variables and rotate the exposed key.",
          })
        );
      }

      // ---------------------------------------
      // Private keys
      // ---------------------------------------

      if (
        /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(
          line
        )
      ) {
        findings.push(
          createFinding({
            severity: "critical",

            title:
              "Private key detected",

            description:
              "A private cryptographic key appears to be included in the source tree.",

            file: relativeFile,

            line: lineNumber,

            suggestion:
              "Remove the private key from the repository and rotate it immediately.",
          })
        );
      }

      // ---------------------------------------
      // JWT secret assignments
      // ---------------------------------------

      if (
        /(jwt[_-]?secret|jwtSecret)\s*[:=]\s*["'`][^"'`]{8,}/i.test(
          line
        )
      ) {
        findings.push(
          createFinding({
            severity: "high",

            title:
              "Potential hardcoded JWT secret",

            description:
              "A value resembling a JWT signing secret appears to be hardcoded.",

            file: relativeFile,

            line: lineNumber,

            suggestion:
              "Store JWT secrets in environment variables or a secure secret manager.",
          })
        );
      }

      // ---------------------------------------
      // Password assignment
      // ---------------------------------------

      if (
        /(password|passwd|pwd)\s*[:=]\s*["'`][^"'`]{4,}/i.test(
          line
        )
      ) {
        findings.push(
          createFinding({
            severity: "high",

            title:
              "Potential hardcoded password",

            description:
              "A password-like value appears to be assigned directly in source code.",

            file: relativeFile,

            line: lineNumber,

            suggestion:
              "Never hardcode passwords. Use environment variables or a secure secret manager.",
          })
        );
      }

      // ---------------------------------------
      // Generic API key detection
      // ---------------------------------------

      if (
        /(api[_-]?key|apikey)\s*[:=]\s*["'`][^"'`]{12,}/i.test(
          line
        )
      ) {
        findings.push(
          createFinding({
            severity: "high",

            title:
              "Potential hardcoded API key",

            description:
              "A value resembling an API key appears to be hardcoded.",

            file: relativeFile,

            line: lineNumber,

            suggestion:
              "Move API credentials to environment variables or a secure secret manager.",
          })
        );
      }

      // ---------------------------------------
      // eval()
      // ---------------------------------------

      if (
        /\beval\s*\(/.test(
          line
        )
      ) {
        findings.push(
          createFinding({
            severity: "high",

            title:
              "Dangerous eval() usage",

            description:
              "The code uses eval(), which can execute dynamically constructed JavaScript.",

            file: relativeFile,

            line: lineNumber,

            suggestion:
              "Avoid eval(). Replace dynamic execution with safer, explicit logic.",
          })
        );
      }

      // ---------------------------------------
      // child_process execution
      // ---------------------------------------

      if (
        /(exec|execSync|spawn|spawnSync)\s*\(/.test(
          line
        ) &&
        /child_process|require\s*\(\s*["']child_process["']\s*\)|from\s+["']child_process["']/.test(
          content
        )
      ) {
        findings.push(
          createFinding({
            severity: "high",

            title:
              "Potential command execution",

            description:
              "The project appears to execute operating-system commands.",

            file: relativeFile,

            line: lineNumber,

            suggestion:
              "Validate all command arguments and avoid passing untrusted user input to operating-system commands.",
          })
        );
      }
    }
  );

  return findings;
};

export const analyzeSecurity = (
  projectDirectory,
  files
) => {
  const findings = [];

  for (const file of files) {
    const extension =
      path.extname(
        file.path
      ).toLowerCase();

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

  return findings;
};