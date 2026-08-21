import React, { useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers3,
  ShieldCheck,
  FlaskConical,
  Gauge,
  FileText,
} from "lucide-react";

const AIReviewCard = ({ analysis }) => {
  const aiReview = analysis?.aiReview;

  const [openSection, setOpenSection] =
    useState(null);

  if (!aiReview) {
    return (
      <section className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
            <Bot size={20} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              CodeLab
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Genome AI Review
            </h2>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-4">
          <p className="text-sm text-slate-400">
            AI repository review is not available
            for this analysis.
          </p>
        </div>
      </section>
    );
  }

  const strengths = Array.isArray(
    aiReview.strengths
  )
    ? aiReview.strengths
    : [];

  const weaknesses = Array.isArray(
    aiReview.weaknesses
  )
    ? aiReview.weaknesses
    : [];

  const criticalRisks = Array.isArray(
    aiReview.criticalRisks
  )
    ? aiReview.criticalRisks
    : [];

  const recommendations = Array.isArray(
    aiReview.recommendations
  )
    ? aiReview.recommendations
    : [];

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section
        ? null
        : section
    );
  };

  const specializedReviews = [
    {
      key: "architecture",
      title: "Architecture Review",
      icon: Layers3,
      value:
        aiReview.architectureReview,
    },
    {
      key: "security",
      title: "Security Review",
      icon: ShieldCheck,
      value:
        aiReview.securityReview,
    },
    {
      key: "testing",
      title: "Testing Review",
      icon: FlaskConical,
      value:
        aiReview.testingReview,
    },
    {
      key: "performance",
      title: "Performance Review",
      icon: Gauge,
      value:
        aiReview.performanceReview,
    },
    {
      key: "documentation",
      title: "Documentation Review",
      icon: FileText,
      value:
        aiReview.documentationReview,
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-[#0d1320] to-[#0d1320] p-6 shadow-xl">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
          <Bot size={22} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Genome AI
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            AI Repository Review
          </h2>
        </div>
      </div>

      {/* SUMMARY */}
      {aiReview.summary && (
        <div className="mt-6 rounded-xl border border-white/[0.07] bg-black/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Summary
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            {aiReview.summary}
          </p>
        </div>
      )}

      {/* STRENGTHS + WEAKNESSES */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* STRENGTHS */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={18}
              className="text-emerald-400"
            />

            <h3 className="font-semibold text-white">
              Strengths
            </h3>
          </div>

          {strengths.length > 0 ? (
            <div className="mt-4 space-y-3">
              {strengths.map(
                (strength, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >
                    <span className="mt-1 text-emerald-400">
                      ✓
                    </span>

                    <p className="text-sm leading-6 text-slate-300">
                      {strength}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No strengths reported.
            </p>
          )}
        </div>

        {/* WEAKNESSES */}
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className="text-yellow-400"
            />

            <h3 className="font-semibold text-white">
              Weaknesses
            </h3>
          </div>

          {weaknesses.length > 0 ? (
            <div className="mt-4 space-y-3">
              {weaknesses.map(
                (weakness, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >
                    <span className="mt-1 text-yellow-400">
                      ⚠
                    </span>

                    <p className="text-sm leading-6 text-slate-300">
                      {weakness}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No weaknesses reported.
            </p>
          )}
        </div>
      </div>

      {/* CRITICAL RISKS */}
      <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5">
        <div className="flex items-center gap-2">
          <ShieldAlert
            size={18}
            className="text-red-400"
          />

          <h3 className="font-semibold text-white">
            Critical Risks
          </h3>
        </div>

        {criticalRisks.length > 0 ? (
          <div className="mt-4 space-y-3">
            {criticalRisks.map(
              (risk, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-red-500/10 bg-black/10 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-red-300">
                      🔴{" "}
                      {risk?.title ||
                        "Critical risk"}
                    </p>

                    {risk?.severity && (
                      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
                        {risk.severity}
                      </span>
                    )}
                  </div>

                  {risk?.reason && (
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {risk.reason}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No critical risks reported.
          </p>
        )}
      </div>

      {/* RECOMMENDATIONS */}
      <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-5">
        <div className="flex items-center gap-2">
          <Lightbulb
            size={18}
            className="text-blue-400"
          />

          <h3 className="font-semibold text-white">
            Recommendations
          </h3>
        </div>

        {recommendations.length > 0 ? (
          <div className="mt-4 space-y-3">
            {recommendations.map(
              (recommendation, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-white">
                          {recommendation?.title ||
                            "Recommendation"}
                        </h4>

                        {recommendation?.priority && (
                          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                            {
                              recommendation.priority
                            }
                          </span>
                        )}
                      </div>

                      {recommendation?.reason && (
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {
                            recommendation.reason
                          }
                        </p>
                      )}

                      {recommendation?.action && (
                        <div className="mt-3 rounded-lg bg-white/[0.03] p-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                            Action
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {
                              recommendation.action
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No recommendations reported.
          </p>
        )}
      </div>

      {/* SPECIALIZED REVIEWS */}
      <div className="mt-5">
        <div className="mb-3 flex items-center gap-2">
          <FileText
            size={17}
            className="text-slate-400"
          />

          <h3 className="font-semibold text-white">
            Specialized Reviews
          </h3>
        </div>

        <div className="space-y-2">
          {specializedReviews.map(
            (review) => {
              const Icon = review.icon;

              const isOpen =
                openSection === review.key;

              const hasReview =
                typeof review.value ===
                  "string" &&
                review.value.trim()
                  .length > 0;

              return (
                <div
                  key={review.key}
                  className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/10"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleSection(
                        review.key
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className="text-violet-400"
                      />

                      <span className="font-medium text-white">
                        {review.title}
                      </span>
                    </div>

                    {isOpen ? (
                      <ChevronUp
                        size={18}
                        className="text-slate-500"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="text-slate-500"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/[0.06] px-4 py-4">
                      {hasReview ? (
                        <p className="text-sm leading-7 text-slate-300">
                          {review.value}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">
                          This review is not available
                          for this analysis.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
};

export default AIReviewCard;