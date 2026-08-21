import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";

const getStatusStyles = (status) => {
  switch (status) {
    case "excellent":
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };

    case "good":
      return {
        text: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
      };

    case "fair":
      return {
        text: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
      };

    case "poor":
      return {
        text: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
      };

    case "critical":
    default:
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      };
  }
};

const formatCategory = (category = "") => {
  return category
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
};

const ProjectHealthCard = ({ projectHealth }) => {
  const health = projectHealth || {};

  const score = Number(health.score) || 0;

  const status =
    health.status ||
    (score >= 90
      ? "excellent"
      : score >= 75
      ? "good"
      : score >= 60
      ? "fair"
      : score >= 40
      ? "poor"
      : "critical");

  const styles = getStatusStyles(status);

  const strongAreas = Array.isArray(health.strongAreas)
    ? health.strongAreas
    : [];

  const weakAreas = Array.isArray(health.weakAreas)
    ? health.weakAreas
    : [];

  return (
    <section
      className={`rounded-2xl border ${styles.border} bg-[#0d1320] p-6 shadow-xl`}
    >
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${styles.bg} ${styles.text}`}
        >
          <HeartPulse size={20} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Project Health
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            Overall Project Health
          </h2>
        </div>
      </div>

      {/* SCORE */}
      <div className="mt-6 text-center">
        <div className={`text-5xl font-bold ${styles.text}`}>
          {score}
          <span className="text-2xl text-slate-500">
            {" "}
            / 100
          </span>
        </div>

        <div
          className={`mx-auto mt-3 inline-flex rounded-full border ${styles.border} ${styles.bg} px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${styles.text}`}
        >
          {status}
        </div>
      </div>

      {/* STRONG AREAS */}
      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Strong Areas
        </p>

        <div className="mt-3 space-y-2">
          {strongAreas.length > 0 ? (
            strongAreas.slice(0, 5).map((area, index) => (
              <div
                key={`${area.category}-${index}`}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-400"
                  />

                  <span className="text-sm text-slate-300">
                    {formatCategory(area.category)}
                  </span>
                </div>

                <span className="text-sm font-semibold text-emerald-400">
                  {area.score ?? 0}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-white/[0.06] p-3 text-sm text-slate-500">
              No strong areas detected yet.
            </p>
          )}
        </div>
      </div>

      {/* WEAK AREAS */}
      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Needs Improvement
        </p>

        <div className="mt-3 space-y-2">
          {weakAreas.length > 0 ? (
            weakAreas.slice(0, 5).map((area, index) => (
              <div
                key={`${area.category}-${index}`}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-yellow-400"
                  />

                  <span className="text-sm text-slate-300">
                    {formatCategory(area.category)}
                  </span>
                </div>

                <span className="text-sm font-semibold text-yellow-400">
                  {area.score ?? 0}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-white/[0.06] p-3 text-sm text-slate-500">
              No major weak areas detected.
            </p>
          )}
        </div>
      </div>

      {/* HIGHEST RISK */}
      {health.highestRisk?.title && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
            Highest Risk
          </p>

          <p className="mt-2 text-sm text-slate-300">
            {health.highestRisk.title}
          </p>
        </div>
      )}

      {/* RECOMMENDED ACTION */}
      {health.recommendedAction && (
        <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Recommended Action
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {health.recommendedAction}
          </p>
        </div>
      )}
    </section>
  );
};

export default ProjectHealthCard;