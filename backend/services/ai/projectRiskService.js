import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const buildRiskPrompt = (context) => {
  return `
You are Genome AI, an expert project risk analyst.

Analyze the following software project data.

PROJECT:
${JSON.stringify(
  context.project,
  null,
  2
)}

TASKS:
${JSON.stringify(
  context.tasks,
  null,
  2
)}

ISSUES:
${JSON.stringify(
  context.issues,
  null,
  2
)}

MILESTONES:
${JSON.stringify(
  context.milestones,
  null,
  2
)}

TEAM:
${JSON.stringify(
  context.team,
  null,
  2
)}

CODELAB ANALYSIS:
${JSON.stringify(
  context.codeAnalysis,
  null,
  2
)}

Identify the most important project risks.

Do NOT invent information.

Base every risk on the supplied project data.

Return ONLY valid JSON.

Use exactly this structure:

{
  "overallRisk": {
    "score": 0,
    "level": "low",
    "summary": "Short explanation"
  },

  "risks": [
    {
      "title": "Risk title",
      "severity": "high",
      "category": "schedule",
      "reason": "Why this is a risk",
      "impact": "Potential impact",
      "recommendation": "Recommended action"
    }
  ],

  "blockers": [
    {
      "title": "Blocker",
      "reason": "Why it blocks progress",
      "impact": "Impact"
    }
  ],

  "recommendedActions": [
    {
      "title": "Action",
      "priority": "high",
      "reason": "Why this should be done"
    }
  ],

  "projectOutlook": "Short overall project outlook"
}
`;
};

export const analyzeProjectRisk =
  async (context) => {
    if (
      !process.env.GEMINI_API_KEY
    ) {
      throw new Error(
        "GEMINI_API_KEY is not configured"
      );
    }

    const prompt =
      buildRiskPrompt(context);

    const response =
      await ai.models.generateContent({
        model:
          "gemini-2.5-flash",

        contents: prompt,

        config: {
          responseMimeType:
            "application/json",
        },
      });

    const text =
      response.text;

    if (!text) {
      throw new Error(
        "AI returned an empty response"
      );
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error(
        "Risk JSON:",
        text
      );

      throw new Error(
        "AI returned invalid risk JSON"
      );
    }
  };