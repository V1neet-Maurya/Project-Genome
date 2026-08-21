import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateTaskPlan = async ({
  project,
  prompt,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured"
    );
  }

  const aiPrompt = `
You are Genome AI, an expert software project planner.

The user wants to build:

"${prompt}"

Project information:
${JSON.stringify(project, null, 2)}

Create a practical development plan.

Generate milestones/phases and tasks.

Rules:

1. Do not create database records.
2. Return only a proposed plan.
3. Tasks must be actionable.
4. Avoid duplicate tasks.
5. Keep the plan realistic.
6. Give each task a priority.
7. Estimate each task duration in hours.
8. Identify task dependencies where useful.

Return ONLY valid JSON.

Use exactly this structure:

{
  "projectSummary": "Short description",

  "milestones": [
    {
      "title": "Authentication",
      "description": "Authentication functionality",

      "tasks": [
        {
          "title": "Create User Model",
          "description": "Create the user database model",
          "priority": "high",
          "estimatedHours": 4,
          "dependencies": []
        }
      ]
    }
  ]
}

Allowed priorities:

low
medium
high
critical
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: aiPrompt,

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
      "AI task generation response:",
      response.text
    );

    throw new Error(
      "Gemini returned invalid JSON"
    );
  }
};