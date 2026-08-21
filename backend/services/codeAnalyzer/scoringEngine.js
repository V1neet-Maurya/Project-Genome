// ==========================================
// GENOME CODELAB SCORING ENGINE
// ==========================================

// ------------------------------------------
// Clamp score between 0 and 100
// ------------------------------------------

const clampScore = (score) => {
  if (
    typeof score !== "number" ||
    !Number.isFinite(score)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
};

// ==========================================
// SEVERITY WEIGHTS
// ==========================================

const severityWeight = {
  critical: 10,
  high: 6,
  medium: 3,
  low: 1,
  info: 0,
};

// ==========================================
// DEPENDENCY SCORE
// ==========================================

export const calculateDependencyScore = ({
  totalDependencies = 0,
  outdated = 0,
  vulnerabilities = 0,
}) => {
  /*
   * A project without dependencies should NOT
   * automatically receive 50/100.
   *
   * There is simply no dependency risk to evaluate.
   */

  if (totalDependencies === 0) {
    return 100;
  }

  let score = 100;

  // Outdated dependencies
  score -= outdated * 4;

  // Vulnerable dependencies
  score -= vulnerabilities * 15;

  return clampScore(score);
};

// ==========================================
// CODE QUALITY SCORE
// ==========================================

export const calculateQualityScore = (
  findings = []
) => {
  if (!Array.isArray(findings)) {
    return 100;
  }

  if (findings.length === 0) {
    return 100;
  }

  let penalty = 0;

  for (const finding of findings) {
    penalty +=
      severityWeight[
        finding?.severity
      ] || 0;
  }

  return clampScore(
    100 - penalty
  );
};

// ==========================================
// SECURITY SCORE
// ==========================================

export const calculateSecurityScore = (
  findings = []
) => {
  if (!Array.isArray(findings)) {
    return 100;
  }

  if (findings.length === 0) {
    return 100;
  }

  const penalties = {
    critical: 25,
    high: 12,
    medium: 6,
    low: 2,
    info: 0,
  };

  let penalty = 0;

  for (const finding of findings) {
    penalty +=
      penalties[
        finding?.severity
      ] || 0;
  }

  return clampScore(
    100 - penalty
  );
};

// ==========================================
// TESTING SCORE
// ==========================================

export const calculateTestingScore = ({
  totalFiles = 0,
  totalTestFiles = 0,
  totalTestCases = 0,
  passedTests = null,
  failedTests = null,
  coverage = null,
}) => {
  if (totalFiles <= 0) {
    return 0;
  }

  /*
   * No automated tests detected.
   *
   * A project with no tests receives 20/100
   * instead of 0 because testing is only one
   * engineering dimension.
   */

  if (totalTestFiles <= 0) {
    return 20;
  }

  let score = 30;

  // ------------------------------------------
  // TEST FILE RATIO
  // ------------------------------------------

  const testFileRatio =
    totalTestFiles /
    totalFiles;

  if (testFileRatio >= 0.30) {
    score += 25;
  } else if (testFileRatio >= 0.20) {
    score += 20;
  } else if (testFileRatio >= 0.10) {
    score += 15;
  } else if (testFileRatio >= 0.05) {
    score += 8;
  } else {
    score += 4;
  }

  // ------------------------------------------
  // TEST CASES
  // ------------------------------------------

  if (totalTestCases >= 30) {
    score += 20;
  } else if (totalTestCases >= 20) {
    score += 16;
  } else if (totalTestCases >= 10) {
    score += 12;
  } else if (totalTestCases >= 5) {
    score += 8;
  } else if (totalTestCases > 0) {
    score += 4;
  }

  // ------------------------------------------
  // TEST EXECUTION
  // ------------------------------------------

  if (
    typeof passedTests === "number" &&
    typeof failedTests === "number"
  ) {
    const executed =
      passedTests +
      failedTests;

    if (executed > 0) {
      const passRate =
        passedTests /
        executed;

      score += Math.round(
        passRate * 15
      );
    }
  }

  // ------------------------------------------
  // COVERAGE
  // ------------------------------------------

  if (
    typeof coverage === "number" &&
    Number.isFinite(coverage)
  ) {
    if (coverage >= 80) {
      score += 15;
    } else if (coverage >= 60) {
      score += 12;
    } else if (coverage >= 40) {
      score += 8;
    } else if (coverage >= 20) {
      score += 4;
    }
  }

  return clampScore(score);
};

// ==========================================
// MAINTAINABILITY SCORE
// ==========================================

export const calculateMaintainabilityScore = ({
  qualityScore = 100,
  architectureScore = 100,
  totalFiles = 0,
  totalLines = 0,
  findings = [],
}) => {
  let score =
    qualityScore * 0.45 +
    architectureScore * 0.35;

  // ------------------------------------------
  // PROJECT SIZE
  // ------------------------------------------

  if (
    totalFiles > 0 &&
    totalLines > 0
  ) {
    const averageLines =
      totalLines /
      totalFiles;

    if (averageLines <= 150) {
      score += 20;
    } else if (averageLines <= 250) {
      score += 15;
    } else if (averageLines <= 400) {
      score += 10;
    } else if (averageLines <= 600) {
      score += 5;
    }
  } else {
    score += 10;
  }

  // ------------------------------------------
  // MAINTAINABILITY FINDINGS
  // ------------------------------------------

  if (Array.isArray(findings)) {
    for (const finding of findings) {
      if (
        finding?.category ===
        "quality"
      ) {
        if (
          finding?.severity ===
          "critical"
        ) {
          score -= 8;
        } else if (
          finding?.severity ===
          "high"
        ) {
          score -= 5;
        } else if (
          finding?.severity ===
          "medium"
        ) {
          score -= 3;
        } else if (
          finding?.severity ===
          "low"
        ) {
          score -= 1;
        }
      }
    }
  }

  return clampScore(score);
};

// ==========================================
// ENGINEERING SCORE
// ==========================================

export const calculateEngineeringScore = ({
  codeQuality = 0,
  security = 0,
  testing = 0,
  architecture = 0,
  maintainability = 0,
  documentation = 0,
  performance = 0,
  dependencies = 0,
}) => {
  /*
   * Genome CodeLab weighted model
   *
   * Code Quality       20%
   * Security           20%
   * Testing            15%
   * Architecture       15%
   * Maintainability    10%
   * Documentation      10%
   * Performance         5%
   * Dependencies        5%
   *
   * Total = 100%
   */

  const categories = [
    {
      name: "codeQuality",
      score: codeQuality,
      weight: 20,
    },
    {
      name: "security",
      score: security,
      weight: 20,
    },
    {
      name: "testing",
      score: testing,
      weight: 15,
    },
    {
      name: "architecture",
      score: architecture,
      weight: 15,
    },
    {
      name: "maintainability",
      score: maintainability,
      weight: 10,
    },
    {
      name: "documentation",
      score: documentation,
      weight: 10,
    },
    {
      name: "performance",
      score: performance,
      weight: 5,
    },
    {
      name: "dependencies",
      score: dependencies,
      weight: 5,
    },
  ];

  const validCategories =
    categories.filter(
      (category) =>
        typeof category.score ===
          "number" &&
        Number.isFinite(
          category.score
        )
    );

  if (
    validCategories.length ===
    0
  ) {
    return 0;
  }

  const weightedScore =
    validCategories.reduce(
      (total, category) => {
        return (
          total +
          clampScore(
            category.score
          ) *
            category.weight
        );
      },
      0
    );

  const totalWeight =
    validCategories.reduce(
      (total, category) =>
        total +
        category.weight,
      0
    );

  if (totalWeight === 0) {
    return 0;
  }

  return clampScore(
    weightedScore /
      totalWeight
  );
};

// ==========================================
// SCORE RATING
// ==========================================

export const getScoreRating = (
  score
) => {
  const value =
    clampScore(score);

  if (value >= 90) {
    return "excellent";
  }

  if (value >= 75) {
    return "good";
  }

  if (value >= 60) {
    return "fair";
  }

  if (value >= 40) {
    return "poor";
  }

  return "critical";
};