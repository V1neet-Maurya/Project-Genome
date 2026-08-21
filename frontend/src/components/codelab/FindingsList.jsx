import React from "react";
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  ShieldAlert,
  Info,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";

const SEVERITIES = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

const severityConfig = {
  critical: {
    label: "CRITICAL",
    icon: ShieldAlert,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    dot: "bg-red-500",
  },

  high: {
    label: "HIGH",
    icon: CircleAlert,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
  },

  medium: {
    label: "MEDIUM",
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    dot: "bg-yellow-500",
  },

  low: {
    label: "LOW",
    icon: AlertTriangle,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },

  info: {
    label: "INFO",
    icon: Info,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    dot: "bg-slate-500",
  },
};

const FindingsList = ({ analysis }) => {
  const [expandedFinding, setExpandedFinding] =
    useState(null);

  const [loadingFinding, setLoadingFinding] =
    useState(null);

  const [fixSuggestions, setFixSuggestions] =
    useState({});

  const findings = Array.isArray(
    analysis?.findings
  )
    ? analysis.findings
    : [];

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const askGenomeAI = async (
    finding,
    index
  ) => {
    try {
      setLoadingFinding(index);

      const response = await axios.post(
        "http://localhost:8000/api/v1/code-analysis/fix-suggestion",
        {
          category: finding.category,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          file: finding.file,
          line: finding.line,
          suggestion: finding.suggestion,
          code: finding.code || "",
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response?.data?.data;

      setFixSuggestions((previous) => ({
        ...previous,
        [index]: data,
      }));

      setExpandedFinding(index);
    } catch (error) {
      console.error(
        "Genome AI fix suggestion error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to generate AI fix suggestion."
      );
    } finally {
      setLoadingFinding(null);
    }
  };

  const groupedFindings = SEVERITIES.reduce(
    (groups, severity) => {
      groups[severity] = findings.filter(
        (finding) =>
          String(
            finding?.severity || "info"
          ).toLowerCase() === severity
      );

      return groups;
    },
    {}
  );

  if (findings.length === 0) {
    return (
      <section className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <CircleAlert size={20} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              CodeLab
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Findings
            </h2>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-5">
          <p className="text-sm font-semibold text-emerald-400">
            No findings detected
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Genome CodeLab did not detect any issues in
            the analyzed repository.
          </p>
        </div>
      </section>
    );
  }

  let globalIndex = 0;

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-6 shadow-xl">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-400">
            <ShieldAlert size={20} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              CodeLab
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Findings
            </h2>
          </div>
        </div>

        <div className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300">
          {findings.length}{" "}
          {findings.length === 1
            ? "finding"
            : "findings"}
        </div>
      </div>

      {/* SEVERITY GROUPS */}
      <div className="mt-6 space-y-6">
        {SEVERITIES.map((severity) => {
          const severityFindings =
            groupedFindings[severity];

          if (severityFindings.length === 0) {
            return null;
          }

          const config =
            severityConfig[severity];

          const SeverityIcon =
            config.icon;

          return (
            <div key={severity}>
              {/* GROUP HEADER */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${config.dot}`}
                />

                <span
                  className={`text-xs font-bold uppercase tracking-wider ${config.color}`}
                >
                  {config.label}
                </span>

                <span className="text-xs text-slate-600">
                  ({severityFindings.length})
                </span>
              </div>

              {/* FINDINGS */}
              <div className="space-y-3">
                {severityFindings.map(
                  (finding, localIndex) => {
                    const currentIndex =
                      globalIndex++;

                    const isExpanded =
                      expandedFinding ===
                      currentIndex;

                    const isLoading =
                      loadingFinding ===
                      currentIndex;

                    const aiFix =
                      fixSuggestions[
                        currentIndex
                      ];

                    return (
                      <div
                        key={
                          finding?._id ||
                          `${severity}-${localIndex}`
                        }
                        className={`overflow-hidden rounded-xl border ${config.border} bg-white/[0.02]`}
                      >
                        {/* FINDING HEADER */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedFinding(
                              isExpanded
                                ? null
                                : currentIndex
                            )
                          }
                          className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-white/[0.03]"
                        >
                          <div className="flex min-w-0 gap-3">
                            <div
                              className={`mt-0.5 shrink-0 ${config.color}`}
                            >
                              <SeverityIcon
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-semibold text-white">
                                {finding?.title ||
                                  "Untitled finding"}
                              </h3>

                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                {finding?.file && (
                                  <span>
                                    {finding.file}
                                  </span>
                                )}

                                {finding?.line !=
                                  null && (
                                  <>
                                    <span>
                                      •
                                    </span>

                                    <span>
                                      Line{" "}
                                      {
                                        finding.line
                                      }
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-slate-500">
                            {isExpanded ? (
                              <ChevronUp
                                size={18}
                              />
                            ) : (
                              <ChevronDown
                                size={18}
                              />
                            )}
                          </div>
                        </button>

                        {/* DETAILS */}
                        {isExpanded && (
                          <div className="border-t border-white/[0.06] p-4">
                            {/* DESCRIPTION */}
                            {finding?.description && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  Description
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                  {
                                    finding.description
                                  }
                                </p>
                              </div>
                            )}

                            {/* SUGGESTION */}
                            {finding?.suggestion && (
                              <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                                  Suggestion
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                  {
                                    finding.suggestion
                                  }
                                </p>
                              </div>
                            )}

                            {/* CODE */}
                            {finding?.code && (
                              <div className="mt-5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  Relevant Code
                                </p>

                                <pre className="mt-2 max-h-60 overflow-auto rounded-xl border border-white/[0.06] bg-black/30 p-4 text-xs leading-5 text-slate-400">
                                  {
                                    finding.code
                                  }
                                </pre>
                              </div>
                            )}

                            {/* ASK GENOME AI */}
                            <div className="mt-5">
                              <button
                                type="button"
                                disabled={
                                  isLoading
                                }
                                onClick={() =>
                                  askGenomeAI(
                                    finding,
                                    currentIndex
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Bot size={17} />

                                {isLoading
                                  ? "Genome AI is analyzing..."
                                  : "Ask Genome AI"}
                              </button>
                            </div>

                            {/* AI RESPONSE */}
                            {aiFix && (
                              <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-5">
                                <div className="flex items-center gap-2">
                                  <Bot
                                    size={18}
                                    className="text-violet-400"
                                  />

                                  <h4 className="font-semibold text-white">
                                    Genome AI — Fix Suggestion
                                  </h4>
                                </div>

                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    AI Prompt
                                  </p>

                                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-black/20 p-4 text-xs leading-6 text-slate-300">
                                    {
                                      aiFix.prompt
                                    }
                                  </pre>
                                </div>

                                <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                                    Finding
                                  </p>

                                  <p className="mt-2 text-sm text-slate-300">
                                    {
                                      aiFix.finding
                                        ?.title
                                    }
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FindingsList;