import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeTeamWorkload =
  async (workload) => {
    const prompt = `
You are Genome AI, a software project
management assistant.

Analyze the following deterministic
team workload metrics.

Do not recalculate the scores.
Do not invent team members or tasks.

WORKLOAD:
${JSON.stringify(
  workload,
  null,
  2
)}

Return ONLY valid JSON:

{
  "summary": "Overall workload summary",

  "overloadedMembers": [
    {
      "memberId": "member id",
      "reason": "Why this person is overloaded"
    }
  ],

  "underutilizedMembers": [
    {
      "memberId": "member id",
      "reason": "Why this person has available capacity"
    }
  ],

  "recommendations": [
    {
      "title": "Recommendation",
      "priority": "high",
      "reason": "Reason"
    }
  ]
}
`;

    const response =
      await ai.models.generateContent({
        model:
          "gemini-3.6-flash",

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
        "Invalid workload AI response:",
        response.text
      );

      throw new Error(
        "Gemini returned invalid JSON"
      );
    }
  };