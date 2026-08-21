import ai from "./aiClient.js";

const askGenome = async ({
  question,
  context,
}) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    config: {
      systemInstruction: `
You are Genome AI, an intelligent project management assistant.

Your job is to analyze project data and help the user make project decisions.

Rules:

1. Only use information provided in the project context.
2. Never invent tasks, users, issues, deadlines, or project information.
3. If the information is insufficient, clearly say so.
4. Give practical and concise answers.
5. When identifying risks, explain why they matter.
6. Do not modify project data yourself.
7. Never expose private information from another project.
`,
    },

    contents: `
PROJECT CONTEXT:

${JSON.stringify(context, null, 2)}

USER QUESTION:

${question}
`,
  });

  return response.text;
};

export default askGenome;