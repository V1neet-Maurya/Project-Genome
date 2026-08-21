import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateProjectPlan =
  async ({
    project,
    requirements,
    team,
  }) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not configured"
      );
    }

    const prompt = `
You are Genome AI, an expert software
project planner.

Create a realistic development plan.

PROJECT:
${JSON.stringify(
  project,
  null,
  2
)}

REQUIREMENTS:
${requirements}

TEAM:
${JSON.stringify(
  team,
  null,
  2
)}

Rules:

1. Create practical milestones.
2. Create actionable tasks.
3. Estimate task duration in hours.
4. Assign suggested team members when appropriate.
5. Identify dependencies.
6. Respect the requested project deadline.
7. Do not create database records.
8. Do not invent team members.
9. Return only valid JSON.

Return exactly:

{
  "summary": "Project planning summary",

  "milestones": [
    {
      "title": "Authentication",
      "description": "Authentication implementation",
      "estimatedDays": 7,

      "tasks": [
        {
          "title": "Create User Model",
          "description": "Create user schema",
          "priority": "high",
          "estimatedHours": 5,
          "suggestedAssignee": null,
          "dependencies": []
        }
      ]
    }
  ],

  "dependencies": [
    {
      "task": "Login API",
      "dependsOn": "User Model"
    }
  ],

  "risks": [
    {
      "title": "Risk",
      "reason": "Reason",
      "severity": "medium"
    }
  ],

  "recommendations": [
    "Recommendation"
  ]
}
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
        "Planner response:",
        response.text
      );

      throw new Error(
        "Gemini returned invalid planner JSON"
      );
    }
  };