// ==========================================
// GENOME PROJECT HEALTH ANALYZER
// ==========================================

// ------------------------------------------
// GET HEALTH RATING
// ------------------------------------------

const getRating = (score) => {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  if (score >= 40) return "poor";

  return "critical";
};

// ------------------------------------------
// GET WEAK AREAS
// ------------------------------------------

const getWeakAreas = (scores) => {
  return Object.entries(scores)
    .filter(
      ([, score]) =>
        typeof score === "number" &&
        Number.isFinite(score) &&
        score < 70
    )
    .sort(
      ([, a], [, b]) => a - b
    )
    .map(
      ([category, score]) => ({
        category,
        score,
      })
    );
};

// ------------------------------------------
// GET STRONG AREAS
// ------------------------------------------

const getStrongAreas = (scores) => {
  return Object.entries(scores)
    .filter(
      ([, score]) =>
        typeof score === "number" &&
        Number.isFinite(score) &&
        score >= 80
    )
    .sort(
      ([, a], [, b]) => b - a
    )
    .map(
      ([category, score]) => ({
        category,
        score,
      })
    );
};

// ==========================================
// ANALYZE PROJECT HEALTH
// ==========================================

export const analyzeProjectHealth = ({
  scores = {},
  findings = [],
}) => {
  const overall =
    Number.isFinite(
      Number(scores.overall)
    )
      ? Number(scores.overall)
      : 0;

  const weakAreas =
    getWeakAreas(scores);

  const strongAreas =
    getStrongAreas(scores);

  const safeFindings =
    Array.isArray(findings)
      ? findings
      : [];

  // ------------------------------------------
  // CRITICAL FINDINGS
  // ------------------------------------------

  const criticalFindings =
    safeFindings.filter(
      (finding) =>
        finding?.severity ===
        "critical"
    );

  // ------------------------------------------
  // HIGH FINDINGS
  // ------------------------------------------

  const highFindings =
    safeFindings.filter(
      (finding) =>
        finding?.severity ===
        "high"
    );

  // ------------------------------------------
  // HEALTH STATUS
  // ------------------------------------------

  const healthStatus =
    getRating(overall);

  // ------------------------------------------
  // HIGHEST RISK
  // ------------------------------------------

  let highestRisk = null;

  if (
    criticalFindings.length > 0
  ) {
    highestRisk = {
      severity: "critical",
      count:
        criticalFindings.length,
      title:
        criticalFindings[0]?.title ||
        "Critical issue detected",
    };
  } else if (
    highFindings.length > 0
  ) {
    highestRisk = {
      severity: "high",
      count:
        highFindings.length,
      title:
        highFindings[0]?.title ||
        "High-severity issue detected",
    };
  } else if (
    weakAreas.length > 0
  ) {
    highestRisk = {
      severity: "medium",
      count:
        weakAreas.length,
      title:
        `${weakAreas[0].category} requires improvement`,
    };
  }

  // ------------------------------------------
  // RECOMMENDED ACTION
  // ------------------------------------------

  let recommendedAction =
    "Continue maintaining the current engineering quality.";

  if (
    criticalFindings.length > 0
  ) {
    recommendedAction =
      `Fix the critical issue: ${
        criticalFindings[0]?.title ||
        "Critical issue"
      }`;
  } else if (
    highFindings.length > 0
  ) {
    recommendedAction =
      `Address the high-severity finding: ${
        highFindings[0]?.title ||
        "High-severity issue"
      }`;
  } else if (
    weakAreas.length > 0
  ) {
    recommendedAction =
      `Improve ${weakAreas[0].category} first.`;
  }

  // ------------------------------------------
  // RETURN HEALTH
  // ------------------------------------------

  return {
    score: Math.round(
      Math.max(
        0,
        Math.min(100, overall)
      )
    ),

    status: healthStatus,

    strongAreas,

    weakAreas,

    highestRisk,

    recommendedAction,
  };
};