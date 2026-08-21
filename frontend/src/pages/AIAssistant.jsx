import { useState } from "react";
import axios from "axios";

const AIAssistant = ({
  projectId,
  token,
}) => {
  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const askAI = async () => {
    if (!question.trim()) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await axios.post(
          `http://localhost:8000/api/v1/ai/assistant/project/${projectId}`,
          {
            question,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setAnswer(
        response.data.data
      );
    } catch (error) {
      console.error(
        "AI Assistant error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="mb-6">
          <p className="text-sm font-semibold text-indigo-600">
            GENOME AI
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Project Assistant
          </h1>

          <p className="mt-2 text-slate-500">
            Ask anything about this project.
          </p>
        </div>

        <div className="flex gap-3">

          <input
            value={question}
            onChange={(e) =>
              setQuestion(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                askAI();
              }
            }}
            placeholder="What is blocking my project?"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <button
            onClick={askAI}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white disabled:opacity-50"
          >
            {loading
              ? "Thinking..."
              : "Ask AI"}
          </button>

        </div>

      </div>

      {answer && (
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="rounded-xl bg-indigo-50 p-5">

            <h2 className="font-semibold text-indigo-900">
              Genome AI
            </h2>

            <p className="mt-2 leading-7 text-slate-700">
              {answer.answer}
            </p>

          </div>

          {answer.highlights?.length >
            0 && (
            <div className="mt-6">

              <h3 className="font-semibold">
                Key Findings
              </h3>

              <div className="mt-3 space-y-2">

                {answer.highlights.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-3 text-sm"
                    >
                      {item}
                    </div>
                  )
                )}

              </div>

            </div>
          )}

          {answer.recommendedActions
            ?.length > 0 && (
            <div className="mt-6">

              <h3 className="font-semibold">
                Recommended Actions
              </h3>

              <div className="mt-3 space-y-3">

                {answer.recommendedActions.map(
                  (
                    action,
                    index
                  ) => (
                    <div
                      key={index}
                      className="rounded-xl border p-4"
                    >
                      <div className="flex justify-between">

                        <h4 className="font-semibold">
                          {action.title}
                        </h4>

                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600">
                          {action.priority}
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {action.reason}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AIAssistant;