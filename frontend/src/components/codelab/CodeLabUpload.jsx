import React from "react";
import {
  Upload,
  BarChart3,
  RefreshCw,
  FolderGit2,
} from "lucide-react";

const CodeLabUpload = ({
  projects = [],
  selectedProject,
  selectedFile,
  loadingProjects = false,
  loadingAnalyses = false,
  analyzing = false,
  analyses = [],
  selectedAnalysis,
  onProjectChange,
  onFileChange,
  onAnalyze,
  onSelectAnalysis,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_0.9fr]">
      {/* =====================================================
          UPLOAD
      ===================================================== */}

      <section className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10">
            <Upload className="h-5 w-5 text-purple-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Analyze Project
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Upload a ZIP of your project to generate an engineering report.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* PROJECT */}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Select Project
            </label>

            <select
              value={selectedProject || ""}
              onChange={onProjectChange}
              disabled={loadingProjects || analyzing}
              className="w-full rounded-xl border border-slate-800 bg-[#080e19] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loadingProjects
                  ? "Loading projects..."
                  : "Select a project"}
              </option>

              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* ZIP */}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Project ZIP
            </label>

            <label
              htmlFor="projectZip"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-[#080e19] px-4 py-3 transition hover:border-purple-500/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <Upload className="h-4 w-4 text-purple-400" />
              </div>

              <span className="truncate text-sm text-slate-300">
                {selectedFile ? selectedFile.name : "Choose ZIP file"}
              </span>
            </label>

            <input
              id="projectZip"
              type="file"
              accept=".zip,application/zip"
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* VALIDATION */}

        {(!selectedProject || !selectedFile) && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {!selectedProject
              ? "Please select a project."
              : "Please select a ZIP file."}
          </div>
        )}

        {/* ANALYZE BUTTON */}

        <button
          type="button"
          onClick={onAnalyze}
          disabled={
            analyzing ||
            loadingProjects ||
            !selectedProject ||
            !selectedFile
          }
          className="mt-5 flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/10 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing Project...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4" />
              Analyze Project
            </>
          )}
        </button>
      </section>

      {/* =====================================================
          ANALYSIS HISTORY
      ===================================================== */}

      <section className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Analysis History
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Recent CodeLab analyses.
          </p>
        </div>

        {loadingAnalyses ? (
          <div className="flex min-h-[230px] items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#080e19] text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
              <FolderGit2 className="h-6 w-6 text-purple-400" />
            </div>

            <p className="font-semibold text-white">
              No analyses yet
            </p>

            <p className="mt-1 max-w-[240px] text-xs leading-5 text-slate-500">
              Upload your first project ZIP to start CodeLab.
            </p>
          </div>
        ) : (
          <div className="max-h-[350px] space-y-3 overflow-y-auto pr-1">
            {analyses.map((analysis) => {
              const score = Number(
                analysis?.scores?.overall
              ) || 0;

              return (
                <button
                  type="button"
                  key={analysis._id}
                  onClick={() => onSelectAnalysis?.(analysis)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedAnalysis?._id === analysis._id
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-slate-800 bg-[#080e19] hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {analysis?.repositoryName ||
                          analysis?.project?.name ||
                          "Project Analysis"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {analysis?.createdAt
                          ? new Date(
                              analysis.createdAt
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Unknown date"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`text-xl font-bold ${
                          score >= 80
                            ? "text-emerald-400"
                            : score >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {score}
                      </p>

                      <p className="text-[10px] text-slate-500">
                        /100
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CodeLabUpload;