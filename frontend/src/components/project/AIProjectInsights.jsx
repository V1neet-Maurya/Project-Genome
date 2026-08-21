import { useState } from "react";
import axios from "axios";

const AIProjectInsights = ({
  projectId,
  token,
}) => {
  const [summary, setSummary] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const generateSummary = async () => {
    try {
      setLoading(true);

      const response =
        await axios.post(
          `http://localhost:8000/api/v1/project-summary/project/${projectId}`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setSummary(
        response.data.data.summary
      );
    } catch (error) {
      console.error(
        "AI summary error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-semibold text-indigo-600">
            GENOME AI
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Project Intelligence
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            AI-powered analysis of your project.
          </p>
        </div>

        <button
          onClick={generateSummary}
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading
            ? "Analyzing..."
            : "Refresh AI"}
        </button>

      </div>

      {!summary && (
        <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">

          <p className="text-sm text-slate-500">
            Generate an AI analysis to see
            the current project status.
          </p>

          <button
            onClick={generateSummary}
            className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white"
          >
            🤖 Analyze Project
          </button>

        </div>
      )}

      {summary && (
        <div className="mt-6">

          <div className="rounded-xl bg-indigo-50 p-5">

            <h3 className="font-semibold text-indigo-900">
              AI Summary
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {summary.summary}
            </p>

          </div>

          {summary.mainConcerns
            ?.length > 0 && (
            <div className="mt-5">

              <h3 className="font-semibold text-slate-900">
                ⚠️ Main Concerns
              </h3>

              <div className="mt-3 space-y-2">

                {summary.mainConcerns.map(
                  (concern, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
                    >
                      {concern}
                    </div>
                  )
                )}

              </div>

            </div>
          )}

          {summary.nextPriorities
            ?.length > 0 && (
            <div className="mt-5">

              <h3 className="font-semibold text-slate-900">
                🎯 Next Priorities
              </h3>

              <div className="mt-3 space-y-3">

                {summary.nextPriorities.map(
                  (
                    priority,
                    index
                  ) => (
                    <div
                      key={index}
                      className="rounded-xl border p-4"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <h4 className="font-medium text-slate-900">
                          {priority.title}
                        </h4>

                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                          {priority.priority}
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {priority.reason}
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

export default AIProjectInsights;