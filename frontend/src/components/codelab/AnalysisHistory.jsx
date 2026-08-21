import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  FileCode2,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL =
  "http://localhost:8000/api/v1/code-analysis";

const AnalysisHistory = ({
  projectId,
  onViewReport,
}) => {
  const [analyses, setAnalyses] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // FETCH ANALYSIS HISTORY
  // ==========================================

  useEffect(() => {
    const fetchAnalysisHistory =
      async () => {
        if (!projectId) {
          return;
        }

        try {
          setLoading(true);
          setError("");

          const token =
            localStorage.getItem("token");

          const response =
            await axios.get(
              `${API_URL}/project/${projectId}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            response?.data?.data || [];

          setAnalyses(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (err) {
          console.error(
            "Failed to load analysis history:",
            err
          );

          setError(
            err?.response?.data?.message ||
              "Failed to load analysis history"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchAnalysisHistory();
  }, [projectId]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // GET SCORE
  // ==========================================

  const getOverallScore = (
    analysis
  ) => {
    return (
      analysis?.scores?.overall ??
      0
    );
  };

  // ==========================================
  // VIEW REPORT
  // ==========================================

  const handleViewReport = (
    analysis
  ) => {
    if (onViewReport) {
      onViewReport(analysis);
      return;
    }

    // Fallback: store selected analysis
    // so CodeLab can use it later.
    console.log(
      "View CodeLab report:",
      analysis
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/[0.08] bg-[#0d1320] p-6">
        <div className="flex items-center justify-center gap-3 py-8 text-slate-400">
          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading analysis history...
        </div>
      </section>
    );
  }

  // ==========================================
  // MAIN COMPONENT
  // ==========================================

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1320] shadow-xl">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="border-b border-white/[0.07] p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
            <FileCode2 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Analysis History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Previous CodeLab analysis reports
            </p>
          </div>
        </div>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="m-5 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-rose-400"
          />

          <p className="text-sm text-rose-300">
            {error}
          </p>
        </div>
      )}

      {/* ======================================
          EMPTY STATE
      ====================================== */}

      {!error &&
        analyses.length === 0 && (
          <div className="p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white/[0.04] text-slate-500">
              <FileCode2 size={22} />
            </div>

            <h3 className="mt-4 font-medium text-white">
              No analyses yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload and analyze a repository
              to create your first CodeLab
              report.
            </p>
          </div>
        )}

      {/* ======================================
          HISTORY LIST
      ====================================== */}

      {analyses.length > 0 && (
        <div className="divide-y divide-white/[0.06]">
          {analyses.map(
            (analysis, index) => {
              const score =
                getOverallScore(
                  analysis
                );

              return (
                <div
                  key={
                    analysis._id ||
                    index
                  }
                  className="p-5 transition hover:bg-white/[0.02]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* ========================
                        LEFT
                    ======================== */}

                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-500/10 text-slate-400">
                          <FileCode2
                            size={18}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-white">
                            {analysis.repositoryName ||
                              "Unknown Repository"}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>
                              {formatDate(
                                analysis.createdAt
                              )}
                            </span>

                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle2
                                size={13}
                              />

                              Completed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ======================
                          SCORE BREAKDOWN
                      ====================== */}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
                          Quality{" "}
                          {analysis
                            ?.scores
                            ?.codeQuality ??
                            0}
                        </span>

                        <span className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">
                          Security{" "}
                          {analysis
                            ?.scores
                            ?.security ??
                            0}
                        </span>

                        <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
                          Testing{" "}
                          {analysis
                            ?.scores
                            ?.testing ??
                            0}
                        </span>
                      </div>
                    </div>

                    {/* ========================
                        RIGHT
                    ======================== */}

                    <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          Overall Score
                        </p>

                        <p className="mt-1 text-2xl font-bold text-white">
                          {score}
                          <span className="text-sm font-normal text-slate-500">
                            /100
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewReport(
                            analysis
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white"
                      >
                        <Eye
                          size={16}
                        />

                        View Report
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
};

export default AnalysisHistory;