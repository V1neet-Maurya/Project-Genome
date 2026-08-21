import fs from "fs";
import path from "path";

/**
 * Create a dependency finding
 */
const createFinding = ({
  severity = "low",
  title,
  description,
  file = null,
  suggestion = null,
}) => {
  return {
    category: "dependency",
    severity,
    title,
    description,
    file,
    suggestion,
  };
};

/**
 * Safely read JSON file
 */
const readJsonFile = (filePath) => {
  try {
    return JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );
  } catch (error) {
    return null;
  }
};

/**
 * Analyze package.json
 */
const analyzePackageJson = (
  projectDirectory,
  relativePath
) => {
  const filePath = path.join(
    projectDirectory,
    relativePath
  );

  const packageJson =
    readJsonFile(filePath);

  if (!packageJson) {
    return null;
  }

  const dependencies =
    packageJson.dependencies || {};

  const devDependencies =
    packageJson.devDependencies || {};

  const dependencyList = [
    ...Object.entries(dependencies).map(
      ([name, version]) => ({
        name,
        version,
        type: "production",
      })
    ),

    ...Object.entries(devDependencies).map(
      ([name, version]) => ({
        name,
        version,
        type: "development",
      })
    ),
  ];

  return {
    ecosystem: "npm",

    manifest: relativePath,

    packageName:
      packageJson.name || null,

    dependencyCount:
      dependencyList.length,

    productionCount:
      Object.keys(dependencies).length,

    developmentCount:
      Object.keys(devDependencies).length,

    dependencies:
      dependencyList,
  };
};

/**
 * Analyze requirements.txt
 */
const analyzeRequirements = (
  projectDirectory,
  relativePath
) => {
  const filePath = path.join(
    projectDirectory,
    relativePath
  );

  try {
    const content =
      fs.readFileSync(
        filePath,
        "utf8"
      );

    const dependencies = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(
        (line) =>
          line &&
          !line.startsWith("#") &&
          !line.startsWith("-")
      )
      .map((line) => {
        const match = line.match(
          /^([A-Za-z0-9_.-]+)\s*(?:==|>=|<=|~=|!=|>|<)?\s*(.*)?$/
        );

        return {
          name: match
            ? match[1]
            : line,

          version:
            match && match[2]
              ? match[2].trim()
              : null,

          type: "production",
        };
      });

    return {
      ecosystem: "python",

      manifest: relativePath,

      packageName: null,

      dependencyCount:
        dependencies.length,

      productionCount:
        dependencies.length,

      developmentCount: 0,

      dependencies,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Analyze pom.xml
 */
const analyzePom = (
  projectDirectory,
  relativePath
) => {
  const filePath = path.join(
    projectDirectory,
    relativePath
  );

  try {
    const content =
      fs.readFileSync(
        filePath,
        "utf8"
      );

    const dependencyBlockMatches =
      content.match(
        /<dependency>[\s\S]*?<\/dependency>/g
      ) || [];

    const dependencies =
      dependencyBlockMatches.map(
        (block) => {
          const artifactMatch =
            block.match(
              /<artifactId>\s*(.*?)\s*<\/artifactId>/
            );

          const versionMatch =
            block.match(
              /<version>\s*(.*?)\s*<\/version>/
            );

          return {
            name:
              artifactMatch
                ? artifactMatch[1]
                : "unknown",

            version:
              versionMatch
                ? versionMatch[1]
                : null,

            type: "production",
          };
        }
      );

    return {
      ecosystem: "maven",

      manifest: relativePath,

      packageName: null,

      dependencyCount:
        dependencies.length,

      productionCount:
        dependencies.length,

      developmentCount: 0,

      dependencies,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Calculate basic dependency health score
 *
 * IMPORTANT:
 * This does NOT claim that packages are vulnerable.
 * Vulnerability detection will be added later using
 * npm audit / OSV or another real vulnerability source.
 */
const calculateDependencyScore = ({
  totalDependencies,
  outdatedCount,
  vulnerabilityCount,
}) => {
  if (totalDependencies === 0) {
    return 100;
  }

  let score = 100;

  score -= outdatedCount * 5;

  score -= vulnerabilityCount * 15;

  return Math.max(
    0,
    Math.min(100, score)
  );
};

/**
 * Main Dependency Analyzer
 */
export const analyzeDependencies = (
  projectDirectory,
  files = []
) => {
  const manifests = files
    .map((file) => {
      if (typeof file === "string") {
        return file.replace(/\\/g, "/");
      }

      return file?.path
        ? file.path.replace(/\\/g, "/")
        : null;
    })
    .filter(Boolean)
    .filter((file) =>
      [
        "package.json",
        "requirements.txt",
        "pom.xml",
      ].some((manifest) =>
        file.endsWith(manifest)
      )
    );

  const projects = [];

  for (const manifest of manifests) {
    let result = null;

    if (
      manifest.endsWith(
        "package.json"
      )
    ) {
      result =
        analyzePackageJson(
          projectDirectory,
          manifest
        );
    } else if (
      manifest.endsWith(
        "requirements.txt"
      )
    ) {
      result =
        analyzeRequirements(
          projectDirectory,
          manifest
        );
    } else if (
      manifest.endsWith(
        "pom.xml"
      )
    ) {
      result =
        analyzePom(
          projectDirectory,
          manifest
        );
    }

    if (result) {
      projects.push(result);
    }
  }

  const totalDependencies =
    projects.reduce(
      (sum, project) =>
        sum +
        project.dependencyCount,
      0
    );

  const productionDependencies =
    projects.reduce(
      (sum, project) =>
        sum +
        project.productionCount,
      0
    );

  const developmentDependencies =
    projects.reduce(
      (sum, project) =>
        sum +
        project.developmentCount,
      0
    );

  /*
   * Currently we don't perform real
   * vulnerability scanning here.
   */
  const outdated = [];

  const vulnerabilities = [];

  const findings = [];

  /*
   * No package.json found
   */
  if (projects.length === 0) {
    findings.push(
      createFinding({
        severity: "info",

        title:
          "No dependency manifest found",

        description:
          "No supported dependency manifest was found in the uploaded project.",

        suggestion:
          "Add a package.json, requirements.txt, or pom.xml file if the project uses external dependencies.",
      })
    );
  }

  /*
   * Large dependency count
   */
  if (
    totalDependencies > 50
  ) {
    findings.push(
      createFinding({
        severity: "medium",

        title:
          "Large dependency footprint",

        description:
          `The project contains ${totalDependencies} dependencies across its manifests.`,

        suggestion:
          "Review dependencies periodically and remove packages that are no longer required.",
      })
    );
  }

  /*
   * Development dependencies
   */
  if (
    developmentDependencies >
    productionDependencies
  ) {
    findings.push(
      createFinding({
        severity: "low",

        title:
          "High development dependency count",

        description:
          `The project has ${developmentDependencies} development dependencies compared with ${productionDependencies} production dependencies.`,

        suggestion:
          "Review development dependencies and remove unused tooling where appropriate.",
      })
    );
  }

  /*
   * Calculate score
   */
  const score =
    calculateDependencyScore({
      totalDependencies,

      outdatedCount:
        outdated.length,

      vulnerabilityCount:
        vulnerabilities.length,
    });

  return {
    score,

    manifests: projects,

    totalDependencies,

    productionDependencies,

    developmentDependencies,

    outdated,

    vulnerabilities,

    findings,
  };
};