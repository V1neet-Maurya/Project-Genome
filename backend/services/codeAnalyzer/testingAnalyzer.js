import fs from "fs";
import path from "path";

const testFilePatterns = [
  /\.test\.(js|jsx|ts|tsx)$/i,
  /\.spec\.(js|jsx|ts|tsx)$/i,
  /(^|\/)tests?\//i,
  /(^|\/)__tests__\//i,

  /\.test\.py$/i,
  /test_.*\.py$/i,

  /Test.*\.java$/i,
];

const detectFrameworkFromPackage = (
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
    const packageJson =
      JSON.parse(
        fs.readFileSync(
          packagePath,
          "utf8"
        )
      );

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (dependencies.vitest) {
      return "Vitest";
    }

    if (dependencies.jest) {
      return "Jest";
    }

    if (dependencies.mocha) {
      return "Mocha";
    }

    if (
      dependencies["@playwright/test"]
    ) {
      return "Playwright";
    }

    if (dependencies.cypress) {
      return "Cypress";
    }

    return null;
  } catch {
    return null;
  }
};

const detectTestCases = (
  content,
  extension
) => {
  if (
    [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
    ].includes(extension)
  ) {
    const testCases =
      (
        content.match(
          /\b(it|test)\s*\(/g
        ) || []
      ).length;

    return testCases;
  }

  if (extension === ".py") {
    return (
      content.match(
        /\bdef\s+test_/g
      ) || []
    ).length;
  }

  if (extension === ".java") {
    return (
      content.match(
        /@Test\b/g
      ) || []
    ).length;
  }

  return 0;
};

const detectTestingFindings = ({
  totalFiles,
  totalTestFiles,
  totalTestCases,
  framework,
}) => {
  const findings = [];

  if (totalTestFiles === 0) {
    findings.push({
      category: "testing",
      severity: "medium",
      title: "No automated tests detected",
      description:
        "No automated test files were detected in the project.",
      suggestion:
        "Add unit and integration tests for important application logic.",
    });

    return findings;
  }

  if (!framework) {
    findings.push({
      category: "testing",
      severity: "low",
      title: "Testing framework not detected",
      description:
        "Test files were detected, but a recognized testing framework was not found.",
      suggestion:
        "Add or configure a standard testing framework such as Jest, Vitest, Mocha, Pytest, or JUnit.",
    });
  }

  if (totalTestCases === 0) {
    findings.push({
      category: "testing",
      severity: "high",
      title: "Test files contain no detectable test cases",
      description:
        "Test files were detected, but no recognizable test cases were found.",
      suggestion:
        "Add executable test cases using the project's testing framework.",
    });
  }

  if (
    totalFiles > 0 &&
    totalTestFiles / totalFiles < 0.05
  ) {
    findings.push({
      category: "testing",
      severity: "low",
      title: "Low test file ratio",
      description:
        "The project contains relatively few test files compared with its source files.",
      suggestion:
        "Increase automated test coverage for core functionality.",
    });
  }

  return findings;
};

export const analyzeTesting = (
  projectDirectory,
  files
) => {
  const testFiles = [];

  let totalTestCases = 0;

  for (const file of files) {
    const normalizedPath =
      file.path.replace(
        /\\/g,
        "/"
      );

    const isTestFile =
      testFilePatterns.some(
        (pattern) =>
          pattern.test(
            normalizedPath
          )
      );

    if (!isTestFile) {
      continue;
    }

    const fullPath =
      path.join(
        projectDirectory,
        file.path
      );

    let content = "";

    try {
      content =
        fs.readFileSync(
          fullPath,
          "utf8"
        );
    } catch {
      continue;
    }

    const extension =
      path.extname(
        file.path
      ).toLowerCase();

    const testCases =
      detectTestCases(
        content,
        extension
      );

    totalTestCases +=
      testCases;

    testFiles.push({
      path: normalizedPath,
      testCases,
    });
  }

  const framework =
    detectFrameworkFromPackage(
      projectDirectory
    );

  const findings =
    detectTestingFindings({
      totalFiles:
        files.length,

      totalTestFiles:
        testFiles.length,

      totalTestCases,

      framework,
    });

  return {
    framework,

    testFiles,

    totalTestFiles:
      testFiles.length,

    totalTestCases,

    passedTests: null,

    failedTests: null,

    coverage: null,

    findings,
  };
};