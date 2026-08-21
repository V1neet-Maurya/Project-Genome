import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const buildPrompt = (context) => {
  return `
You are Genome AI, an expert software project
planning and schedule prediction assistant.

Analyze the project data below and predict whether
the project is likely to meet its deadline.

PROJECT:
${JSON.stringify(
  context.project,
  null,
  2
)}

TASK STATISTICS:
${JSON.stringify(
  context.taskStatistics,
  null,
  2
)}

TEAM:
${JSON.stringify(
  context.team,
  null,
  2
)}

CURRENT DATE:
${context.currentDate}

Rules:

1. Use only the supplied information.
2. Do not invent task completion data.
3. Consider completed tasks, remaining tasks,
   overdue tasks and current project progress.
4. Estimate a realistic completion date.
5. If there is insufficient information,
   clearly state that.
6. Confidence must be between 0 and 100.

Return ONLY valid JSON.

Use exactly:

{
  "predictedCompletionDate": "YYYY-MM-DD",
  "confidence": 0,
  "riskLevel": "low",
  "status": "on-track",
  "delayDays": 0,
  "reason": "Explanation",
  "recommendations": [
    "Recommendation 1"
  ]
}

Allowed risk levels:

low
medium
high
critical

Allowed status values:

on-track
at-risk
delayed
`;
};

export const predictDeadline =
  async (context) => {
    if (
      !process.env.GEMINI_API_KEY
    ) {
      throw new Error(
        "GEMINI_API_KEY is not configured"
      );
    }

    const prompt =
      buildPrompt(context);

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
        "Deadline prediction response:",
        text
      );

      throw new Error(
        "AI returned invalid deadline prediction JSON"
      );
    }
  };