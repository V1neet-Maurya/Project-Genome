import React from "react";

import {
  BarChart3,
  ShieldCheck,
  FlaskConical,
  Boxes,
  FolderGit2,
  FileText,
  Gauge,
} from "lucide-react";

const SCORE_ITEMS = [
  {
    name: "Code Quality",
    key: "codeQuality",
    icon: BarChart3,
  },
  {
    name: "Security",
    key: "security",
    icon: ShieldCheck,
  },
  {
    name: "Testing",
    key: "testing",
    icon: FlaskConical,
  },
  {
    name: "Architecture",
    key: "architecture",
    icon: Boxes,
  },
  {
    name: "Maintainability",
    key: "maintainability",
    icon: FolderGit2,
  },
  {
    name: "Documentation",
    key: "documentation",
    icon: FileText,
  },
  {
    name: "Performance",
    key: "performance",
    icon: Gauge,
  },
  {
    name: "Dependencies",
    key: "dependencies",
    icon: ShieldCheck,
  },
];

const getScoreColor = (score) => {
  if (score >= 80) {
    return "text-emerald-400";
  }

  if (score >= 60) {
    return "text-yellow-400";
  }

  return "text-red-400";
};

const getScoreBar = (score) => {
  if (score >= 80) {
    return "bg-emerald-500";
  }

  if (score >= 60) {
    return "bg-yellow-500";
  }

  return "bg-red-500";
};

const getScoreLabel = (score) => {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 80) {
    return "Very Good";
  }

  if (score >= 70) {
    return "Good";
  }

  if (score >= 60) {
    return "Fair";
  }

  return "Needs Improvement";
};

const ScoreBreakdown = ({ scores = {} }) => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">
      {/* HEADER */}

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
            <BarChart3 className="h-5 w-5 text-purple-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Score Breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detailed engineering quality metrics.
            </p>
          </div>
        </div>
      </div>

      {/* OVERALL */}

      <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Overall Engineering Score
            </p>

            <p
              className={`mt-2 text-4xl font-bold ${getScoreColor(
                Number(scores?.overall) || 0
              )}`}
            >
              {Number(scores?.overall) || 0}
              <span className="ml-1 text-lg font-normal text-slate-500">
                /100
              </span>
            </p>
          </div>

          <div
            className={`rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-wider ${getScoreColor(
              Number(scores?.overall) || 0
            )}`}
          >
            {getScoreLabel(Number(scores?.overall) || 0)}
          </div>
        </div>
      </div>

      {/* SCORE GRID */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SCORE_ITEMS.map(
          ({ name, key, icon: Icon }) => {
            const score =
              Number(scores?.[key]) || 0;

            const safeScore = Math.min(
              100,
              Math.max(0, score)
            );

            return (
              <div
                key={key}
                className="rounded-xl border border-slate-800 bg-[#080e19] p-4 transition hover:border-slate-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />

                    <span className="text-sm text-slate-300">
                      {name}
                    </span>
                  </div>

                  <span
                    className={`font-bold ${getScoreColor(
                      score
                    )}`}
                  >
                    {score}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreBar(
                      score
                    )}`}
                    style={{
                      width: `${safeScore}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">
                    Engineering metric
                  </span>

                  <span
                    className={`text-[10px] font-medium ${getScoreColor(
                      score
                    )}`}
                  >
                    {getScoreLabel(score)}
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
};

export default ScoreBreakdown;