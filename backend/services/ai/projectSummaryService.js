import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateProjectSummary =
  async (context) => {
    const prompt = `
You are Genome AI, an expert software
project manager.

Generate a concise project status summary
using ONLY the information provided below.

PROJECT:
${JSON.stringify(
  context.project,
  null,
  2
)}

TASK METRICS:
${JSON.stringify(
  context.taskMetrics,
  null,
  2
)}

ISSUE METRICS:
${JSON.stringify(
  context.issueMetrics,
  null,
  2
)}

CODELAB:
${JSON.stringify(
  context.codeLab,
  null,
  2
)}

RISK:
${JSON.stringify(
  context.risk,
  null,
  2
)}

DEADLINE:
${JSON.stringify(
  context.deadline,
  null,
  2
)}

Return ONLY valid JSON:

{
  "summary": "Short project summary",

  "currentStatus": "on-track",

  "mainConcerns": [
    "Concern 1"
  ],

  "completedWork": [
    "Completed item"
  ],

  "nextPriorities": [
    {
      "title": "Priority",
      "reason": "Why this matters",
      "priority": "high"
    }
  ]
}

Allowed currentStatus values:

on-track
at-risk
delayed
blocked

Do not invent information.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: prompt,

        config: {
          responseMimeType:
            "application/json",
        },
      });

    if (!response.text) {
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
        "Project summary response:",
        response.text
      );

      throw new Error(
        "Gemini returned invalid project summary JSON"
      );
    }
  };