import fs from "fs";
import path from "path";

const exists = (directory, target) => {
  return fs.existsSync(
    path.join(directory, target)
  );
};

const findDirectory = (
  directory,
  names
) => {
  return names.find((name) =>
    exists(directory, name)
  );
};

export const analyzeArchitecture = (
  projectDirectory,
  projectInfo,
  files
) => {
  const findings = [];

  const architecture = {
    type: "Unknown",

    frontend: null,

    backend: null,

    database: null,

    directories: [],

    patterns: [],
  };

  // -----------------------------------------
  // FRONTEND DETECTION
  // -----------------------------------------

  if (
    projectInfo.frameworks.includes(
      "React"
    )
  ) {
    architecture.frontend =
      "React";
  } else if (
    projectInfo.frameworks.includes(
      "Vue"
    )
  ) {
    architecture.frontend =
      "Vue";
  } else if (
    projectInfo.frameworks.includes(
      "Next.js"
    )
  ) {
    architecture.frontend =
      "Next.js";
  }

  // -----------------------------------------
  // BACKEND DETECTION
  // -----------------------------------------

  if (
    projectInfo.frameworks.includes(
      "Express"
    )
  ) {
    architecture.backend =
      "Express";
  }

  // -----------------------------------------
  // DATABASE DETECTION
  // -----------------------------------------

  const allFiles =
    files.map(
      (file) =>
        file.path.replace(
          /\\/g,
          "/"
        )
    );

  const hasMongoose =
    allFiles.some(
      (file) =>
        file.endsWith(
          "package.json"
        )
    );

  if (hasMongoose) {
    const packagePath =
      path.join(
        projectDirectory,
        "package.json"
      );

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

      if (dependencies.mongoose) {
        architecture.database =
          "MongoDB";
      }

      if (dependencies.pg) {
        architecture.database =
          "PostgreSQL";
      }

      if (
        dependencies.mysql ||
        dependencies.mysql2
      ) {
        architecture.database =
          "MySQL";
      }
    } catch {
      // Ignore invalid package.json
    }
  }

  // -----------------------------------------
  // ARCHITECTURE TYPE
  // -----------------------------------------

  if (
    architecture.frontend ===
      "React" &&
    architecture.backend ===
      "Express" &&
    architecture.database ===
      "MongoDB"
  ) {
    architecture.type =
      "MERN Application";
  } else if (
    architecture.frontend &&
    architecture.backend
  ) {
    architecture.type =
      "Full Stack Application";
  } else if (
    architecture.backend
  ) {
    architecture.type =
      "Backend Application";
  } else if (
    architecture.frontend
  ) {
    architecture.type =
      "Frontend Application";
  }

  // -----------------------------------------
  // DIRECTORY STRUCTURE
  // -----------------------------------------

  const directoryPatterns = [
    {
      name: "controllers",
      category: "backend",
    },
    {
      name: "models",
      category: "database",
    },
    {
      name: "routes",
      category: "backend",
    },
    {
      name: "middleware",
      category: "backend",
    },
    {
      name: "services",
      category: "backend",
    },
    {
      name: "components",
      category: "frontend",
    },
    {
      name: "pages",
      category: "frontend",
    },
    {
      name: "hooks",
      category: "frontend",
    },
    {
      name: "utils",
      category: "shared",
    },
    {
      name: "tests",
      category: "testing",
    },
  ];

  for (
    const directory of directoryPatterns
  ) {
    const found =
      findDirectory(
        projectDirectory,
        [directory.name]
      );

    if (found) {
      architecture.directories.push(
        directory
      );
    }
  }

  // -----------------------------------------
  // ARCHITECTURAL FINDINGS
  // -----------------------------------------

  if (
    architecture.backend ===
      "Express"
  ) {
    const hasControllers =
      architecture.directories.some(
        (directory) =>
          directory.name ===
          "controllers"
      );

    const hasRoutes =
      architecture.directories.some(
        (directory) =>
          directory.name ===
          "routes"
      );

    if (!hasControllers) {
      findings.push({
        category:
          "architecture",

        severity:
          "medium",

        title:
          "Controller layer not detected",

        description:
          "The Express application does not appear to have a dedicated controllers directory.",

        suggestion:
          "Consider separating request handling logic into controllers.",
      });
    }

    if (!hasRoutes) {
      findings.push({
        category:
          "architecture",

        severity:
          "medium",

        title:
          "Route layer not detected",

        description:
          "The Express application does not appear to have a dedicated routes directory.",

        suggestion:
          "Separate API route definitions from application logic.",
      });
    }
  }

  // -----------------------------------------
  // SERVICE LAYER
  // -----------------------------------------

  if (
    architecture.backend ===
    "Express"
  ) {
    const hasServices =
      architecture.directories.some(
        (directory) =>
          directory.name ===
          "services"
      );

    if (!hasServices) {
      findings.push({
        category:
          "architecture",

        severity:
          "low",

        title:
          "Service layer not detected",

        description:
          "No dedicated service layer was detected.",

        suggestion:
          "For larger applications, consider moving business logic into services instead of keeping everything inside controllers.",
      });
    }
  }

  // -----------------------------------------
  // TEST DIRECTORY
  // -----------------------------------------

  const hasTests =
    architecture.directories.some(
      (directory) =>
        directory.name ===
        "tests"
    );

  if (!hasTests) {
    findings.push({
      category:
        "architecture",

      severity:
        "low",

      title:
        "Dedicated test directory not detected",

      description:
        "No dedicated tests directory was detected.",

      suggestion:
        "Consider organizing automated tests into a dedicated testing structure.",
    });
  }

  // -----------------------------------------
  // SCORE
  // -----------------------------------------

  let score = 100;

  for (
    const finding of findings
  ) {
    if (
      finding.severity ===
      "critical"
    ) {
      score -= 20;
    }

    if (
      finding.severity ===
      "high"
    ) {
      score -= 10;
    }

    if (
      finding.severity ===
      "medium"
    ) {
      score -= 6;
    }

    if (
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
    architecture,
    findings,
  };
};