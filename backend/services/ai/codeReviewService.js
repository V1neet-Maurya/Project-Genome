import { GoogleGenAI } from "@google/genai";

// ==========================================
// GEMINI CLIENT
// ==========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ==========================================
// BUILD AI PROMPT
// ==========================================

const buildPrompt = (analysis) => {
  return `
You are Genome AI, an expert software engineering reviewer.

Genome has already statically analyzed a software project.

Your job is to review the analysis and provide useful,
specific, realistic, and actionable engineering recommendations.

IMPORTANT:
- Do not invent problems.
- Only make recommendations supported by the supplied analysis.
- Prioritize high-impact issues.
- Treat static-analysis findings as potential concerns unless the
  supplied data proves that they are actual bugs.
- Keep the response concise but useful.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not wrap the JSON in code fences.

========================================
PROJECT INFORMATION
========================================

${JSON.stringify(
  analysis.projectInfo || {},
  null,
  2
)}

========================================
ENGINEERING SCORES
========================================

${JSON.stringify(
  analysis.scores || {},
  null,
  2
)}

========================================
FINDINGS
========================================

${JSON.stringify(
  analysis.findings || [],
  null,
  2
)}

========================================
TEST RESULTS
========================================

${JSON.stringify(
  analysis.testResults || {},
  null,
  2
)}

========================================
RETURN EXACTLY THIS JSON STRUCTURE
========================================

{
  "summary": "Short overall assessment of the project",

  "strengths": [
    "Strength 1",
    "Strength 2"
  ],

  "weaknesses": [
    "Weakness 1",
    "Weakness 2"
  ],

  "criticalRisks": [
    {
      "title": "Risk title",
      "severity": "critical",
      "reason": "Why this risk matters"
    }
  ],

  "recommendations": [
    {
      "title": "Recommendation title",
      "priority": "high",
      "reason": "Why this recommendation matters",
      "action": "Specific action the developer should take"
    }
  ],

  "architectureReview": "Architecture assessment",

  "securityReview": "Security assessment",

  "testingReview": "Testing assessment",

  "performanceReview": "Performance assessment",

  "documentationReview": "Documentation assessment"
}

========================================
RULES
========================================

1. Do not invent findings.

2. Base every weakness and recommendation on the supplied
   project analysis.

3. Give higher priority to critical and high severity findings.

4. If a score is low, explain why based on the supplied findings
   or test results.

5. If a category has a strong score, mention that as a strength
   where appropriate.

6. Do not claim that a heuristic finding is definitely a bug.

7. For example, a nested loop should be described as a
   potential performance concern unless the supplied data
   proves it is a performance bug.

8. Security findings should be treated seriously.

9. Keep summary concise.

10. Return valid JSON only.
`;
};

// ==========================================
// REVIEW PROJECT WITH GEMINI
// ==========================================

export const reviewProjectWithAI = async (
  analysis
) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured"
    );
  }

  if (!analysis) {
    throw new Error(
      "Analysis data is required for AI review"
    );
  }

  const prompt = buildPrompt(analysis);

  try {
    console.log(
      "===================================="
    );

    console.log(
      "GENOME AI CODE REVIEW"
    );

    console.log(
      "Gemini model: gemini-3.6-flash"
    );

    console.log(
      "Sending project analysis to Gemini..."
    );

    console.log(
      "===================================="
    );

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: prompt,

        config: {
          responseMimeType:
            "application/json",
        },
      });

    const text =
      response?.text?.trim();

    if (!text) {
      console.error(
        "Gemini returned an empty response:",
        response
      );

      throw new Error(
        "Gemini returned an empty response"
      );
    }

    console.log(
      "Gemini response received successfully"
    );

    // ==========================================
    // PARSE JSON
    // ==========================================

    let parsedResponse;

    try {
      parsedResponse =
        JSON.parse(text);
    } catch (parseError) {
      console.error(
        "Gemini JSON parse error:"
      );

      console.error(text);

      throw new Error(
        "Gemini returned invalid JSON"
      );
    }

    // ==========================================
    // NORMALIZE RESPONSE
    // ==========================================

    const aiReview = {
      summary:
        typeof parsedResponse.summary ===
        "string"
          ? parsedResponse.summary
          : "",

      strengths:
        Array.isArray(
          parsedResponse.strengths
        )
          ? parsedResponse.strengths
          : [],

      weaknesses:
        Array.isArray(
          parsedResponse.weaknesses
        )
          ? parsedResponse.weaknesses
          : [],

      criticalRisks:
        Array.isArray(
          parsedResponse.criticalRisks
        )
          ? parsedResponse.criticalRisks.map(
              (risk) => ({
                title:
                  risk?.title || "",

                severity:
                  risk?.severity || "medium",

                reason:
                  risk?.reason || "",
              })
            )
          : [],

      recommendations:
        Array.isArray(
          parsedResponse.recommendations
        )
          ? parsedResponse.recommendations.map(
              (recommendation) => ({
                title:
                  recommendation?.title ||
                  "",

                priority:
                  recommendation?.priority ||
                  "medium",

                reason:
                  recommendation?.reason ||
                  "",

                action:
                  recommendation?.action ||
                  "",
              })
            )
          : [],

      architectureReview:
        typeof parsedResponse.architectureReview ===
        "string"
          ? parsedResponse.architectureReview
          : "",

      securityReview:
        typeof parsedResponse.securityReview ===
        "string"
          ? parsedResponse.securityReview
          : "",

      testingReview:
        typeof parsedResponse.testingReview ===
        "string"
          ? parsedResponse.testingReview
          : "",

      performanceReview:
        typeof parsedResponse.performanceReview ===
        "string"
          ? parsedResponse.performanceReview
          : "",

      documentationReview:
        typeof parsedResponse.documentationReview ===
        "string"
          ? parsedResponse.documentationReview
          : "",
    };

    console.log(
      "AI review parsed successfully"
    );

    return aiReview;
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "GENOME AI REVIEW ERROR"
    );

    console.error(
      error
    );

    console.error(
      "===================================="
    );

    throw error;
  }
};