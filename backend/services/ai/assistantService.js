import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

// =====================================================
// GEMINI JSON HELPER
// =====================================================

const generateJSON = async (prompt) => {
  const response =
    await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType:
          "application/json",
      },
    });

  if (
    !response ||
    !response.text
  ) {
    throw new Error(
      "Gemini returned an empty response"
    );
  }

  try {
    return JSON.parse(
      response.text
    );
  } catch (error) {
    console.error(
      "Invalid Gemini JSON response:",
      response.text
    );

    throw new Error(
      "Gemini returned invalid JSON"
    );
  }
};

// =====================================================
// GENOME AI ASSISTANT
// =====================================================

export const askGenomeAI = async ({
  question,
  context,
}) => {
  if (!question?.trim()) {
    throw new Error(
      "Question is required"
    );
  }

  const prompt = `
You are Genome AI, an intelligent
software project management assistant.

Answer the user's question using ONLY
the supplied project context.

Do not invent:

- tasks
- issues
- team members
- scores
- deadlines
- milestones
- project information

USER QUESTION:

${question}

PROJECT CONTEXT:

${JSON.stringify(
    context,
    null,
    2
  )}

Return ONLY valid JSON.

Use exactly this structure:

{
  "answer": "Clear answer to the user's question",
  "highlights": [
    "Important finding"
  ],
  "recommendedActions": [
    {
      "title": "Recommended action",
      "priority": "high",
      "reason": "Why this action is recommended"
    }
  ]
}
`;

  return generateJSON(prompt);
};

// =====================================================
// GENOME AI - REPOSITORY REVIEW
// =====================================================

export const generateRepositoryReview =
  async ({
    repositoryName,
    languages,
    frameworks,
    scores,
    findings,
    dependencyAnalysis,
    testing,
    architecture,
    documentation,
  }) => {
    const prompt = `
You are Genome AI, an expert software
engineering reviewer.

Review the following repository analysis.

IMPORTANT RULES:

1. Use ONLY the supplied repository analysis.
2. Do not invent findings.
3. Do not invent technologies.
4. Do not invent vulnerabilities.
5. Do not invent test results.
6. Do not invent architecture details.
7. If information is unavailable, say so.
8. Prioritize critical and high severity findings.
9. Give practical engineering recommendations.
10. Return ONLY valid JSON.

==================================================
REPOSITORY
==================================================

${repositoryName || "Unknown repository"}

==================================================
LANGUAGES
==================================================

${JSON.stringify(
      languages || [],
      null,
      2
    )}

==================================================
FRAMEWORKS
==================================================

${JSON.stringify(
      frameworks || [],
      null,
      2
    )}

==================================================
SCORES
==================================================

${JSON.stringify(
      scores || {},
      null,
      2
    )}

==================================================
ARCHITECTURE
==================================================

${JSON.stringify(
      architecture || {},
      null,
      2
    )}

==================================================
TESTING
==================================================

${JSON.stringify(
      testing || {},
      null,
      2
    )}

==================================================
DOCUMENTATION
==================================================

${JSON.stringify(
      documentation || {},
      null,
      2
    )}

==================================================
DEPENDENCIES
==================================================

${JSON.stringify(
      dependencyAnalysis || {},
      null,
      2
    )}

==================================================
FINDINGS
==================================================

${JSON.stringify(
      findings || [],
      null,
      2
    )}

==================================================
REVIEW REQUIREMENTS
==================================================

Analyze the supplied repository data and produce:

1. Overall project summary
2. Engineering strengths
3. Engineering weaknesses
4. Critical risks
5. Recommended actions
6. Architecture review
7. Security review
8. Testing review
9. Performance review
10. Documentation review

For recommendations:

- critical = immediate security or stability issue
- high = important engineering issue
- medium = should be addressed
- low = improvement opportunity

Do not call something a security vulnerability
unless the supplied findings support it.

Do not claim tests are passing unless the supplied
testing information supports that conclusion.

Do not claim coverage exists unless coverage data
is supplied.

==================================================
RESPONSE FORMAT
==================================================

Return ONLY valid JSON using exactly:

{
  "summary": "",

  "strengths": [],

  "weaknesses": [],

  "criticalRisks": [
    {
      "title": "",
      "severity": "",
      "reason": ""
    }
  ],

  "recommendations": [
    {
      "title": "",
      "priority": "",
      "reason": "",
      "action": ""
    }
  ],

  "architectureReview": "",

  "securityReview": "",

  "testingReview": "",

  "performanceReview": "",

  "documentationReview": ""
}

Do not include markdown.
Do not include explanations outside JSON.
`;

    return generateJSON(prompt);
  };

// =====================================================
// GENOME AI - CODELAB REVIEW ADAPTER
// =====================================================
//
// Keeps the existing controller API working.
//
// =====================================================

export const reviewProjectWithAI =
  async ({
    projectInfo,
    scores,
    findings,
    testResults,
    dependencyAnalysis,
    architecture,
    documentation,
  }) => {
    return generateRepositoryReview({
      repositoryName:
        projectInfo?.repositoryName ||
        projectInfo?.name ||
        "Unknown repository",

      languages:
        projectInfo?.languages || [],

      frameworks:
        projectInfo?.frameworks || [],

      scores:
        scores || {},

      findings:
        findings || [],

      dependencyAnalysis:
        dependencyAnalysis || {},

      testing:
        testResults || {},

      architecture:
        architecture || {},

      documentation:
        documentation || {},
    });
  };