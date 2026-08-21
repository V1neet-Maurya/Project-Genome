import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync =
  promisify(execFile);

// ==========================================
// CONFIGURATION
// ==========================================

const TEST_TIMEOUT = 120000;

// ==========================================
// PACKAGE.JSON
// ==========================================

const readPackageJson = (
  projectDirectory
) => {
  const packagePath = path.join(
    projectDirectory,
    "package.json"
  );

  if (!fs.existsSync(packagePath)) {
    return null;
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        packagePath,
        "utf8"
      )
    );
  } catch {
    return null;
  }
};

// ==========================================
// SAFE COMMAND EXECUTION
// ==========================================

const runCommand = async (
  command,
  args,
  cwd
) => {
  try {
    const result =
      await execFileAsync(
        command,
        args,
        {
          cwd,
          timeout:
            TEST_TIMEOUT,

          maxBuffer:
            5 * 1024 * 1024,

          windowsHide: true,
        }
      );

    return {
      success: true,

      stdout:
        result.stdout || "",

      stderr:
        result.stderr || "",
    };
  } catch (error) {
    return {
      success: false,

      stdout:
        error.stdout || "",

      stderr:
        error.stderr || "",

      error:
        error.message,
    };
  }
};

// ==========================================
// PARSE JEST/VITEST OUTPUT
// ==========================================

const parseJavaScriptResults = (
  output
) => {
  const text =
    output || "";

  let passed = 0;
  let failed = 0;
  let total = 0;

  const testSummary =
    text.match(
      /Tests:\s+.*?(\d+)\s+passed.*?(\d+)\s+failed/i
    );

  if (testSummary) {
    passed =
      Number(
        testSummary[1]
      ) || 0;

    failed =
      Number(
        testSummary[2]
      ) || 0;
  }

  const totalMatch =
    text.match(
      /Tests:\s+.*?(\d+)\s+total/i
    );

  if (totalMatch) {
    total =
      Number(
        totalMatch[1]
      ) || 0;
  }

  if (
    total === 0 &&
    passed + failed > 0
  ) {
    total =
      passed + failed;
  }

  const passRate =
    total > 0
      ? Math.round(
          (passed / total) *
            100
        )
      : 0;

  return {
    total,
    passed,
    failed,
    passRate,
  };
};

// ==========================================
// JAVASCRIPT TEST RUNNER
// ==========================================

const runJavaScriptTests = async (
  projectDirectory,
  framework
) => {
  const packageJson =
    readPackageJson(
      projectDirectory
    );

  if (!packageJson) {
    return {
      executed: false,
      reason:
        "package.json not found",
    };
  }

  let command;
  let args;

  if (framework === "Jest") {
    command =
      process.platform ===
      "win32"
        ? "npx.cmd"
        : "npx";

    args = [
      "jest",
      "--runInBand",
      "--coverage",
    ];
  } else if (
    framework === "Vitest"
  ) {
    command =
      process.platform ===
      "win32"
        ? "npx.cmd"
        : "npx";

    args = [
      "vitest",
      "run",
      "--coverage",
    ];
  } else if (
    framework === "Mocha"
  ) {
    command =
      process.platform ===
      "win32"
        ? "npx.cmd"
        : "npx";

    args = [
      "mocha",
    ];
  } else {
    return {
      executed: false,
      reason:
        "Unsupported JavaScript testing framework",
    };
  }

  const result =
    await runCommand(
      command,
      args,
      projectDirectory
    );

  const combinedOutput =
    `${result.stdout}\n${result.stderr}`;

  const parsed =
    parseJavaScriptResults(
      combinedOutput
    );

  return {
    executed: true,

    framework,

    total:
      parsed.total,

    passed:
      parsed.passed,

    failed:
      parsed.failed,

    passRate:
      parsed.passRate,

    success:
      result.success,

    output:
      combinedOutput.slice(
        0,
        10000
      ),
  };
};

// ==========================================
// MAIN TEST RUNNER
// ==========================================

export const runProjectTests =
  async ({
    projectDirectory,
    framework,
  }) => {
    if (!framework) {
      return {
        executed: false,

        framework: null,

        total: 0,

        passed: 0,

        failed: 0,

        passRate: 0,

        coverage: 0,

        reason:
          "No supported testing framework detected.",
      };
    }

    if (
      [
        "Jest",
        "Vitest",
        "Mocha",
      ].includes(framework)
    ) {
      const result =
        await runJavaScriptTests(
          projectDirectory,
          framework
        );

      return {
        ...result,

        coverage: 0,
      };
    }

    return {
      executed: false,

      framework,

      total: 0,

      passed: 0,

      failed: 0,

      passRate: 0,

      coverage: 0,

      reason:
        "Testing framework detected but execution is not supported yet.",
    };
  };