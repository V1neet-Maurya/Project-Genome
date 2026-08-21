AnalysisComparison.jsx


import { useEffect, useMemo, useState } from "react";

import {
  ArrowDown,
  ArrowUp,
  GitCompareArrows,
  Loader2,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const AnalysisComparison = ({ analyses = [] }) => {
  const [previousId, setPreviousId] = useState("");
  const [currentId, setCurrentId] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sortedAnalyses = useMemo(() => {
    if (!Array.isArray(analyses)) return [];

    return [...analyses].sort(
      (a, b) =>
        new Date(b?.createdAt || 0).getTime() -
        new Date(a?.createdAt || 0).getTime()
    );
  }, [analyses]);

  useEffect(() => {
    if (sortedAnalyses.length >= 2) {
      setCurrentId((value) => value || sortedAnalyses[0]?._id || "");
      setPreviousId((value) => value || sortedAnalyses[1]?._id || "");
    }
  }, [sortedAnalyses]);

  const getAnalysisById = (id) =>
    sortedAnalyses.find((analysis) => analysis?._id === id);

  const handleCompare = async () => {
    setError("");
    setComparison(null);

    if (!previousId || !currentId) {
      setError("Please select both previous and current analyses.");
      return;
    }

    if (previousId === currentId) {
      setError("Previous and current analyses must be different.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/code-analysis/compare", {
        previousAnalysisId: previousId,
        currentAnalysisId: currentId,
      });

      setComparison(response?.data?.data || null);
    } catch (err) {
      console.error("Analysis comparison failed:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to compare analyses."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderChange = (change) => {
    const numericChange = Number(change) || 0;

    if (numericChange > 0) {
      return (
        <span className="flex items-center justify-end gap-1 font-semibold text-emerald-400">
          +{numericChange} <ArrowUp className="h-4 w-4" />
        </span>
      );
    }

    if (numericChange < 0) {
      return (
        <span className="flex items-center justify-end gap-1 font-semibold text-red-400">
          {numericChange} <ArrowDown className="h-4 w-4" />
        </span>
      );
    }

    return (
      <span className="font-semibold text-slate-500">No change</span>
    );
  };

  const formatCategory = (category) => {
    const labels = {
      overall: "Overall",
      codeQuality: "Quality",
      security: "Security",
      testing: "Testing",
      architecture: "Architecture",
      maintainability: "Maintainability",
      documentation: "Documentation",
      performance: "Performance",
      dependencies: "Dependencies",
    };

    return labels[category] || category;
  };

  const buildRows = () => {
    if (!comparison) return [];

    const rows = Array.isArray(comparison.comparison)
      ? [...comparison.comparison]
      : [];

    const previous =
      comparison.previousAnalysis || getAnalysisById(previousId);
    const current =
      comparison.currentAnalysis || getAnalysisById(currentId);

    const hasOverall = rows.some(
      (item) => item?.category === "overall"
    );

    if (!hasOverall) {
      const previousOverall =
        previous?.scores?.overall ??
        comparison.previous?.scores?.overall ??
        0;
      const currentOverall =
        current?.scores?.overall ??
        comparison.current?.scores?.overall ??
        0;

      rows.unshift({
        category: "overall",
        previous: previousOverall,
        current: currentOverall,
        change: currentOverall - previousOverall,
      });
    }

    return rows;
  };

  if (sortedAnalyses.length < 2) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10">
            <GitCompareArrows className="h-5 w-5 text-purple-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Compare Code Analyses
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Run at least two CodeLab analyses to compare project progress.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b111d]">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10">
            <GitCompareArrows className="h-5 w-5 text-purple-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Compare Code Analyses
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Measure how your engineering health changed between analyses.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Previous
          </label>

          <select
            value={previousId}
            onChange={(event) => setPreviousId(event.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-800 bg-[#080e19] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Select previous analysis</option>
            {sortedAnalyses.map((analysis) => (
              <option key={analysis._id} value={analysis._id}>
                {analysis?.repositoryName ||
                  analysis?.project?.name ||
                  "Project Analysis"}
                {analysis?.createdAt
                  ? ` — ${new Date(analysis.createdAt).toLocaleDateString()}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Current
          </label>

          <select
            value={currentId}
            onChange={(event) => setCurrentId(event.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-800 bg-[#080e19] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Select current analysis</option>
            {sortedAnalyses.map((analysis) => (
              <option key={analysis._id} value={analysis._id}>
                {analysis?.repositoryName ||
                  analysis?.project?.name ||
                  "Project Analysis"}
                {analysis?.createdAt
                  ? ` — ${new Date(analysis.createdAt).toLocaleDateString()}`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-5 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={handleCompare}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <GitCompareArrows className="h-4 w-4" />
              Compare
            </>
          )}
        </button>
      </div>

      {comparison && (
        <div className="border-t border-slate-800 p-6">
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-[#080e19] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Previous
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-white">
                {comparison?.previous?.repositoryName ||
                  getAnalysisById(previousId)?.repositoryName ||
                  "Previous Analysis"}
              </p>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-purple-400">
                Current
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-white">
                {comparison?.current?.repositoryName ||
                  getAnalysisById(currentId)?.repositoryName ||
                  "Current Analysis"}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-slate-800 bg-[#080e19] px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Metric</span>
              <span>Previous</span>
              <span>Current</span>
              <span>Change</span>
            </div>

            <div className="divide-y divide-slate-800">
              {buildRows().map((item) => (
                <div
                  key={item.category}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-4"
                >
                  <span className="text-sm font-medium text-slate-200">
                    {formatCategory(item.category)}
                  </span>

                  <span className="text-sm text-slate-400">
                    {item.previous ?? 0}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {item.current ?? 0}
                  </span>

                  {renderChange(item.change)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AnalysisComparison;