import React from "react";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  PlayCircle,
} from "lucide-react";

const TestResultsCard = ({ analysis }) => {
  // Support the current CodeLab analysis structure:
  // analysis.testing.testResults
  const testResults =
    analysis?.testing?.testResults || {};

  const framework =
    testResults.framework || "Unknown";

  const executed =
    testResults.executed === true;

  const total =
    Number(testResults.total) || 0;

  const passed =
    Number(testResults.passed) || 0;

  const failed =
    Number(testResults.failed) || 0;

  const passRate =
    Number(testResults.accuracy) || 0;

  const coverage =
    Number(testResults.coverage) || 0;

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-6 shadow-xl">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
          <FlaskConical size={20} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            CodeLab
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            Test Results
          </h2>
        </div>
      </div>

      {/* TEST INFORMATION */}
      <div className="mt-6 space-y-3">
        {/* FRAMEWORK */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <span className="text-sm text-slate-400">
            Framework
          </span>

          <span className="font-medium text-white">
            {framework}
          </span>
        </div>

        {/* EXECUTED */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <span className="text-sm text-slate-400">
            Executed
          </span>

          {executed ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 size={16} />
              Yes
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
              <PlayCircle size={16} />
              No
            </span>
          )}
        </div>

        {/* TOTAL */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <span className="text-sm text-slate-400">
            Total
          </span>

          <span className="font-semibold text-white">
            {total}
          </span>
        </div>

        {/* PASSED */}
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle2
              size={16}
              className="text-emerald-400"
            />
            Passed
          </span>

          <span className="font-semibold text-emerald-400">
            {passed}
          </span>
        </div>

        {/* FAILED */}
        <div className="flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/[0.03] px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-slate-400">
            <XCircle
              size={16}
              className="text-red-400"
            />
            Failed
          </span>

          <span className="font-semibold text-red-400">
            {failed}
          </span>
        </div>

        {/* PASS RATE */}
        <div className="flex items-center justify-between rounded-xl border border-violet-500/10 bg-violet-500/[0.03] px-4 py-3">
          <span className="text-sm text-slate-400">
            Pass Rate
          </span>

          <span className="font-semibold text-violet-400">
            {passRate}%
          </span>
        </div>

        {/* COVERAGE */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Coverage
            </span>

            <span className="font-semibold text-white">
              {coverage}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, coverage)
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* TESTS NOT EXECUTED */}
      {!executed && (
        <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.05] p-4">
          <p className="text-sm font-semibold text-yellow-400">
            Tests were not executed.
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Reason:
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-300">
            {testResults.reason ||
              "No supported testing framework detected."}
          </p>
        </div>
      )}

      {/* TEST OUTPUT */}
      {executed && testResults.output && (
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-medium text-slate-400 transition hover:text-white">
            View test output
          </summary>

          <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-white/[0.06] bg-black/30 p-4 text-xs leading-5 text-slate-400">
            {testResults.output}
          </pre>
        </details>
      )}
    </section>
  );
};

export default TestResultsCard;