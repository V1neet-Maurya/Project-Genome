import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  FlaskConical,
  FolderGit2,
  Gauge,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";

import api from "../services/api";

// IMPORTANT:
// Vercel/Linux is case-sensitive.
// Keep this folder name exactly the same as your
// actual folder name.
import CodeLabUpload from "../components/codelab/CodeLabUpload";
import ScoreBreakdown from "../components/codelab/ScoreBreakdown";

// =====================================================
// CODELAB
// =====================================================

const CodeLab = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState(null);

  const [aiReview, setAiReview] = useState(null);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingAnalyses, setLoadingAnalyses] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [taskLoading, setTaskLoading] =
    useState(null);

  const [issueLoading, setIssueLoading] =
    useState(null);

  const [fixLoading, setFixLoading] =
    useState(null);

  const [createdTasks, setCreatedTasks] =
    useState({});

  const [createdIssues, setCreatedIssues] =
    useState({});

  const [fixSuggestion, setFixSuggestion] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchProjects();
    fetchAnalyses();
  }, []);

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");

      const response = await api.get("/projects");

      const projectList =
        response?.data?.projects ||
        response?.data?.data?.projects ||
        (Array.isArray(response?.data?.data)
          ? response.data.data
          : []);

      setProjects(
        Array.isArray(projectList)
          ? projectList
          : []
      );
    } catch (err) {
      console.error(
        "Failed to fetch projects:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load projects."
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  // =====================================================
  // FETCH ALL ANALYSES
  // =====================================================

  const fetchAnalyses = async () => {
    try {
      setLoadingAnalyses(true);

      const response = await api.get(
        "/code-analysis"
      );

      const analysisList =
        response?.data?.data?.analyses ||
        response?.data?.analyses ||
        (Array.isArray(response?.data?.data)
          ? response.data.data
          : []);

      const safeList = Array.isArray(
        analysisList
      )
        ? analysisList
        : [];

      setAnalyses(safeList);

      if (
        safeList.length > 0 &&
        !selectedAnalysis
      ) {
        const latest = safeList[0];

        setSelectedAnalysis(latest);

        setAiReview(
          latest?.aiReview || null
        );
      }
    } catch (err) {
      console.error(
        "Failed to fetch analyses:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load analysis history."
      );
    } finally {
      setLoadingAnalyses(false);
    }
  };

  // =====================================================
  // FETCH PROJECT ANALYSES
  // =====================================================

  const fetchProjectAnalyses = async (
    projectId
  ) => {
    if (!projectId) {
      return [];
    }

    try {
      const response = await api.get(
        `/code-analysis/project/${projectId}`
      );

      const history =
        response?.data?.data?.analyses ||
        response?.data?.analyses ||
        (Array.isArray(response?.data?.data)
          ? response.data.data
          : []);

      const safeHistory = Array.isArray(
        history
      )
        ? history
        : [];

      setAnalyses(safeHistory);

      if (safeHistory.length > 0) {
        setSelectedAnalysis(
          safeHistory[0]
        );

        setAiReview(
          safeHistory[0]?.aiReview ||
            null
        );
      }

      return safeHistory;
    } catch (err) {
      console.error(
        "Failed to refresh project analyses:",
        err
      );

      return [];
    }
  };

  // =====================================================
  // PROJECT CHANGE
  // =====================================================

  const handleProjectChange = async (
    event
  ) => {
    const projectId =
      event.target.value;

    setSelectedProject(projectId);
    setSelectedAnalysis(null);
    setAiReview(null);
    setFixSuggestion(null);

    setCreatedTasks({});
    setCreatedIssues({});

    setError("");
    setSuccess("");

    if (!projectId) {
      await fetchAnalyses();
      return;
    }

    try {
      setLoadingAnalyses(true);

      const response = await api.get(
        `/code-analysis/project/${projectId}`
      );

      const history =
        response?.data?.data?.analyses ||
        response?.data?.analyses ||
        (Array.isArray(response?.data?.data)
          ? response.data.data
          : []);

      const safeHistory = Array.isArray(
        history
      )
        ? history
        : [];

      setAnalyses(safeHistory);

      if (safeHistory.length > 0) {
        const latest =
          safeHistory[0];

        setSelectedAnalysis(latest);

        setAiReview(
          latest?.aiReview || null
        );
      }
    } catch (err) {
      console.error(
        "Failed to fetch project analyses:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load project analysis history."
      );

      setAnalyses([]);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  // =====================================================
  // FILE CHANGE
  // =====================================================

  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".zip")
    ) {
      setSelectedFile(null);

      setError(
        "Please select a ZIP file."
      );

      event.target.value = "";

      return;
    }

    setSelectedFile(file);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // ANALYZE PROJECT
  // =====================================================

  const analyzeProject = async () => {
    setError("");
    setSuccess("");

    if (!selectedProject) {
      setError(
        "Please select a project."
      );

      return;
    }

    if (!selectedFile) {
      setError(
        "Please select a ZIP file."
      );

      return;
    }

    try {
      setAnalyzing(true);

      const formData =
        new FormData();

      formData.append(
        "projectZip",
        selectedFile
      );

      formData.append(
        "project",
        selectedProject
      );

      const response =
        await api.post(
          "/code-analysis/analyze",
          formData
        );

      const analysis =
        response?.data?.data?.analysis ||
        response?.data?.analysis ||
        response?.data?.data;

      setSuccess(
        "Project analyzed successfully."
      );

      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "projectZip"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      const refreshedHistory =
        await fetchProjectAnalyses(
          selectedProject
        );

      if (analysis?._id) {
        setSelectedAnalysis(
          analysis
        );

        setAiReview(
          analysis?.aiReview ||
            null
        );

        setFixSuggestion(null);
      } else if (
        refreshedHistory.length > 0
      ) {
        const latest =
          refreshedHistory[0];

        setSelectedAnalysis(
          latest
        );

        setAiReview(
          latest?.aiReview ||
            null
        );
      }
    } catch (err) {
      console.error(
        "Project analysis failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Project analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // =====================================================
  // SELECT ANALYSIS
  // =====================================================

  const selectAnalysis = (
    analysis
  ) => {
    setSelectedAnalysis(
      analysis
    );

    setAiReview(
      analysis?.aiReview ||
        null
    );

    setFixSuggestion(null);

    setCreatedTasks({});
    setCreatedIssues({});

    setError("");
    setSuccess("");
  };

  // =====================================================
  // GENERATE AI REVIEW
  // =====================================================

  const generateAIReview = async () => {
    if (!selectedAnalysis?._id) {
      setError(
        "Please select an analysis first."
      );

      return;
    }

    try {
      setAiLoading(true);
      setError("");
      setSuccess("");

      const response =
        await api.post(
          `/code-analysis/${selectedAnalysis._id}/ai-review`,
          {}
        );

      const review =
        response?.data?.data?.aiReview ||
        response?.data?.aiReview;

      if (!review) {
        throw new Error(
          "AI review was not returned."
        );
      }

      setAiReview(review);

      setSelectedAnalysis(
        (previous) => ({
          ...previous,
          aiReview: review,
        })
      );

      setAnalyses(
        (previous) =>
          previous.map(
            (item) =>
              item._id ===
              selectedAnalysis._id
                ? {
                    ...item,
                    aiReview:
                      review,
                  }
                : item
          )
      );

      setSuccess(
        "AI review generated successfully."
      );
    } catch (err) {
      console.error(
        "AI review failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "AI review failed."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // =====================================================
  // ASK GENOME AI TO FIX FINDING
  // =====================================================

  const generateFixSuggestion = async (
    finding,
    index
  ) => {
    if (!finding) {
      return;
    }

    try {
      setFixLoading(index);
      setError("");
      setSuccess("");

      const response =
        await api.post(
          "/code-analysis/fix-suggestion",
          {
            category:
              finding.category,

            severity:
              finding.severity,

            title:
              finding.title,

            description:
              finding.description,

            file:
              finding.file,

            line:
              finding.line,

            suggestion:
              finding.suggestion,

            code:
              finding.code || "",
          }
        );

      const data =
        response?.data?.data;

      if (!data) {
        throw new Error(
          "Fix suggestion was not returned."
        );
      }

      setFixSuggestion({
        ...data,
        finding,
      });

      setSuccess(
        "Genome AI fix suggestion prepared."
      );
    } catch (err) {
      console.error(
        "Fix suggestion failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to generate fix suggestion."
      );
    } finally {
      setFixLoading(null);
    }
  };

  // =====================================================
  // CREATE TASK FROM AI RECOMMENDATION
  // =====================================================

  const createTaskFromRecommendation =
    async (
      recommendationIndex
    ) => {
      if (!selectedAnalysis?._id) {
        setError(
          "Please select an analysis first."
        );

        return;
      }

      try {
        setTaskLoading(
          recommendationIndex
        );

        setError("");
        setSuccess("");

        const response =
          await api.post(
            "/ai-actions/create-task",
            {
              analysisId:
                selectedAnalysis._id,

              recommendationIndex,
            }
          );

        const taskData =
          response?.data?.data ||
          {};

        setCreatedTasks(
          (previous) => ({
            ...previous,

            [recommendationIndex]:
              true,
          })
        );

        setSuccess(
          "Task created successfully from AI recommendation."
        );

        return taskData;
      } catch (err) {
        console.error(
          "Failed to create task:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to create task."
        );
      } finally {
        setTaskLoading(null);
      }
    };

  // =====================================================
  // CREATE ISSUE FROM FINDING
  // =====================================================

  const createIssueFromFinding =
    async (
      findingIndex
    ) => {
      if (!selectedAnalysis?._id) {
        setError(
          "Please select an analysis first."
        );

        return;
      }

      if (
        createdIssues[
          findingIndex
        ]
      ) {
        return;
      }

      try {
        setIssueLoading(
          findingIndex
        );

        setError("");
        setSuccess("");

        const response =
          await api.post(
            "/ai-actions/create-issue",
            {
              analysisId:
                selectedAnalysis._id,

              findingIndex,
            }
          );

        const issueData =
          response?.data?.data ||
          {};

        setCreatedIssues(
          (previous) => ({
            ...previous,

            [findingIndex]:
              true,
          })
        );

        if (
          issueData.alreadyExists
        ) {
          setSuccess(
            "This finding is already linked to a Genome issue."
          );
        } else {
          setSuccess(
            "Issue created successfully from CodeLab finding."
          );
        }

        return issueData;
      } catch (err) {
        console.error(
          "Failed to create issue:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to create issue."
        );
      } finally {
        setIssueLoading(null);
      }
    };

  // =====================================================
  // DELETE ANALYSIS
  // =====================================================

  const deleteAnalysis = async (
    analysisId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this analysis?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/code-analysis/${analysisId}`
      );

      const remaining =
        analyses.filter(
          (item) =>
            item._id !==
            analysisId
        );

      setAnalyses(
        remaining
      );

      if (
        selectedAnalysis?._id ===
        analysisId
      ) {
        const nextAnalysis =
          remaining.length > 0
            ? remaining[0]
            : null;

        setSelectedAnalysis(
          nextAnalysis
        );

        setAiReview(
          nextAnalysis?.aiReview ||
            null
        );

        setFixSuggestion(null);

        setCreatedTasks({});
        setCreatedIssues({});
      }

      setSuccess(
        "Analysis deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete analysis:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete analysis."
      );
    }
  };

  // =====================================================
  // SCORE HELPERS
  // =====================================================

  const getScoreColor = (
    score
  ) => {
    const value =
      Number(score) || 0;

    if (value >= 80) {
      return "text-emerald-400";
    }

    if (value >= 60) {
      return "text-yellow-400";
    }

    return "text-red-400";
  };

  const getScoreLabel = (
    score
  ) => {
    const value =
      Number(score) || 0;

    if (value >= 90) {
      return "Excellent";
    }

    if (value >= 80) {
      return "Very Good";
    }

    if (value >= 70) {
      return "Good";
    }

    if (value >= 60) {
      return "Fair";
    }

    return "Needs Improvement";
  };

  // =====================================================
  // SEVERITY ICON
  // =====================================================

  const getSeverityIcon = (
    severity
  ) => {
    switch (
      severity?.toLowerCase()
    ) {
      case "critical":
        return (
          <XCircle className="h-5 w-5 text-red-500" />
        );

      case "high":
        return (
          <AlertTriangle className="h-5 w-5 text-orange-400" />
        );

      case "medium":
        return (
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        );

      case "low":
        return (
          <AlertTriangle className="h-5 w-5 text-blue-400" />
        );

      default:
        return (
          <CheckCircle2 className="h-5 w-5 text-slate-400" />
        );
    }
  };

  // =====================================================
  // PRIORITY
  // =====================================================

  const getPriorityClass = (
    priority
  ) => {
    switch (
      priority?.toLowerCase()
    ) {
      case "critical":
      case "high":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "medium":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      case "low":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

      default:
        return "border-slate-700 bg-slate-800/50 text-slate-300";
    }
  };

  // =====================================================
  // CURRENT DATA
  // =====================================================

  const scores =
    selectedAnalysis?.scores ||
    {};

  const projectHealth =
    selectedAnalysis?.projectHealth ||
    {
      score:
        scores.overall ||
        0,

      status:
        getScoreLabel(
          scores.overall ||
            0
        ).toLowerCase(),

      strongAreas: [],
      weakAreas: [],
      highestRisk: null,

      recommendedAction:
        "Continue improving the project.",
    };

  const testResults =
    selectedAnalysis?.testResults ||
    selectedAnalysis?.testing
      ?.testResults ||
    {};

  const findings =
    Array.isArray(
      selectedAnalysis?.findings
    )
      ? selectedAnalysis.findings
      : [];

  const currentAiReview =
    aiReview ||
    selectedAnalysis?.aiReview ||
    null;

  // =====================================================
  // GROUP FINDINGS
  // =====================================================

  const groupedFindings =
    useMemo(() => {
      const groups = {
        critical: [],
        high: [],
        medium: [],
        low: [],
        info: [],
      };

      findings.forEach(
        (finding) => {
          const severity =
            finding?.severity?.toLowerCase() ||
            "info";

          if (
            groups[severity]
          ) {
            groups[severity].push(
              finding
            );
          } else {
            groups.info.push(
              finding
            );
          }
        }
      );

      return groups;
    }, [findings]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-full bg-[#070b14] px-6 py-8 text-white">
      <div className="mx-auto max-w-[1400px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10">
              <BrainCircuit className="h-7 w-7 text-purple-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                CodeLab
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Analyze your project and measure
                its engineering health.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={
              selectedProject
                ? () =>
                    fetchProjectAnalyses(
                      selectedProject
                    )
                : fetchAnalyses
            }
            disabled={
              loadingAnalyses
            }
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0b111d] px-4 py-2.5 text-sm text-slate-300 transition hover:border-purple-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={
                loadingAnalyses
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />

            Refresh
          </button>

        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />

            <span>
              {error}
            </span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />

            <span>
              {success}
            </span>
          </div>
        )}

        {/* =================================================
            UPLOAD COMPONENT
        ================================================= */}

        <CodeLabUpload
          projects={projects}
          selectedProject={
            selectedProject
          }
          selectedFile={
            selectedFile
          }
          loadingProjects={
            loadingProjects
          }
          loadingAnalyses={
            loadingAnalyses
          }
          analyzing={
            analyzing
          }
          analyses={
            analyses
          }
          selectedAnalysis={
            selectedAnalysis
          }
          onProjectChange={
            handleProjectChange
          }
          onFileChange={
            handleFileChange
          }
          onAnalyze={
            analyzeProject
          }
          onSelectAnalysis={
            selectAnalysis
          }
        />

        {/* =================================================
            SELECTED ANALYSIS
        ================================================= */}

        {selectedAnalysis && (
          <div className="mt-6 space-y-6">

            {/* =================================================
                ENGINEERING SCORE
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div>

                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />

                    <span className="text-xs font-medium uppercase tracking-wider text-purple-400">
                      Engineering Score
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold">
                    {selectedAnalysis
                      ?.project
                      ?.name ||
                      selectedAnalysis?.repositoryName ||
                      "Project"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedAnalysis
                      ?.repositoryName ||
                      "Repository analysis"}
                  </p>

                </div>

                <div className="text-left md:text-right">

                  <div
                    className={`text-6xl font-bold ${getScoreColor(
                      scores.overall ??
                        0
                    )}`}
                  >
                    {scores.overall ??
                      0}

                    <span className="ml-1 text-2xl text-slate-500">
                      /100
                    </span>
                  </div>

                  <p
                    className={`mt-1 text-sm font-medium ${getScoreColor(
                      scores.overall ??
                        0
                    )}`}
                  >
                    {getScoreLabel(
                      scores.overall ??
                        0
                    )}
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                PROJECT HEALTH
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Gauge className="h-5 w-5 text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Project Health
                  </h2>

                  <p className="text-sm text-slate-500">
                    Overall engineering health of your repository.
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">

                {/* HEALTH SCORE */}

                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#080e19] p-6">

                  <div
                    className={`text-6xl font-bold ${getScoreColor(
                      projectHealth.score ??
                        0
                    )}`}
                  >
                    {projectHealth.score ??
                      0}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    / 100
                  </div>

                  <div
                    className={`mt-4 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase ${getScoreColor(
                      projectHealth.score ??
                        0
                    )}`}
                  >
                    {projectHealth.status ||
                      "unknown"}
                  </div>

                </div>

                {/* HEALTH DETAILS */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* STRONG AREAS */}

                  <div>

                    <h3 className="mb-3 text-sm font-semibold text-white">
                      Strong Areas
                    </h3>

                    {projectHealth
                      .strongAreas
                      ?.length > 0 ? (

                      <div className="space-y-2">

                        {projectHealth.strongAreas.map(
                          (
                            area,
                            index
                          ) => (
                            <div
                              key={`${area.category}-${index}`}
                              className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3"
                            >
                              <span className="text-sm text-slate-300">
                                ✓{" "}
                                {
                                  area.category
                                }
                              </span>

                              <span className="font-semibold text-emerald-400">
                                {
                                  area.score
                                }
                              </span>
                            </div>
                          )
                        )}

                      </div>

                    ) : (

                      <p className="text-sm text-slate-500">
                        No strong areas identified yet.
                      </p>

                    )}

                  </div>

                  {/* WEAK AREAS */}

                  <div>

                    <h3 className="mb-3 text-sm font-semibold text-white">
                      Needs Improvement
                    </h3>

                    {projectHealth
                      .weakAreas
                      ?.length > 0 ? (

                      <div className="space-y-2">

                        {projectHealth.weakAreas.map(
                          (
                            area,
                            index
                          ) => (
                            <div
                              key={`${area.category}-${index}`}
                              className="flex items-center justify-between rounded-xl border border-yellow-500/10 bg-yellow-500/5 px-4 py-3"
                            >
                              <span className="text-sm text-slate-300">
                                ⚠{" "}
                                {
                                  area.category
                                }
                              </span>

                              <span className="font-semibold text-yellow-400">
                                {
                                  area.score
                                }
                              </span>
                            </div>
                          )
                        )}

                      </div>

                    ) : (

                      <p className="text-sm text-slate-500">
                        No weak areas detected.
                      </p>

                    )}

                  </div>

                  {/* RECOMMENDED ACTION */}

                  <div className="md:col-span-2">

                    <h3 className="mb-2 text-sm font-semibold text-white">
                      Recommended Action
                    </h3>

                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-sm leading-6 text-slate-300">
                      {projectHealth.recommendedAction ||
                        "Continue maintaining the current engineering quality."}
                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SCORE BREAKDOWN
            ================================================= */}

            <ScoreBreakdown
              scores={scores}
            />

            {/* =================================================
                TEST RESULTS
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                  <FlaskConical className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Test Results
                  </h2>

                  <p className="text-sm text-slate-500">
                    Repository test execution and coverage.
                  </p>
                </div>

              </div>

              {!testResults?.executed ? (

                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">

                  <div className="flex gap-3">

                    <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" />

                    <div>

                      <p className="font-medium text-yellow-300">
                        Tests were not executed.
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {testResults?.reason ||
                          "No supported testing framework detected."}
                      </p>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="grid grid-cols-2 gap-4 md:grid-cols-6">

                  <div className="rounded-xl border border-slate-800 bg-[#080e19] p-4">
                    <p className="text-xs text-slate-500">
                      Framework
                    </p>

                    <p className="mt-2 font-semibold">
                      {testResults?.framework ||
                        "Unknown"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#080e19] p-4">
                    <p className="text-xs text-slate-500">
                      Total
                    </p>

                    <p className="mt-2 text-xl font-bold">
                      {testResults?.total ??
                        0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                    <p className="text-xs text-slate-500">
                      Passed
                    </p>

                    <p className="mt-2 text-xl font-bold text-emerald-400">
                      {testResults?.passed ??
                        0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
                    <p className="text-xs text-slate-500">
                      Failed
                    </p>

                    <p className="mt-2 text-xl font-bold text-red-400">
                      {testResults?.failed ??
                        0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#080e19] p-4">
                    <p className="text-xs text-slate-500">
                      Pass Rate
                    </p>

                    <p className="mt-2 text-xl font-bold text-blue-400">
                      {testResults?.passRate ??
                        testResults?.accuracy ??
                        0}
                      %
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#080e19] p-4">
                    <p className="text-xs text-slate-500">
                      Coverage
                    </p>

                    <p className="mt-2 text-xl font-bold text-purple-400">
                      {testResults?.coverage ??
                        0}
                      %
                    </p>
                  </div>

                </div>

              )}

            </section>

            {/* =================================================
                REPOSITORY DETAILS
            ================================================= */}

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* REPOSITORY */}

              <div className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">

                <div className="flex items-center gap-3">
                  <FolderGit2 className="h-5 w-5 text-purple-400" />

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Repository
                  </p>
                </div>

                <p className="mt-3 break-all text-sm font-medium text-white">
                  {selectedAnalysis?.repositoryName ||
                    "Unknown repository"}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-slate-500">
                      Files
                    </p>

                    <p className="mt-1 text-lg font-semibold text-white">
                      {selectedAnalysis?.totalFiles ??
                        0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Lines
                    </p>

                    <p className="mt-1 text-lg font-semibold text-white">
                      {selectedAnalysis?.totalLines ??
                        0}
                    </p>
                  </div>

                </div>

              </div>

              {/* DOCUMENTATION */}

              <div className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Documentation
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-slate-500">
                      Source Files
                    </p>

                    <p className="mt-1 text-lg font-semibold text-white">
                      {selectedAnalysis
                        ?.documentationAnalysis
                        ?.sourceFiles ??
                        0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      With Comments
                    </p>

                    <p className="mt-1 text-lg font-semibold text-white">
                      {selectedAnalysis
                        ?.documentationAnalysis
                        ?.filesWithComments ??
                        0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      README
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedAnalysis
                        ?.documentationAnalysis
                        ?.readmeFound
                        ? "Found"
                        : "Missing"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Comments
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedAnalysis
                        ?.documentationAnalysis
                        ?.commentPercentage ??
                        0}
                      %
                    </p>
                  </div>

                </div>

              </div>

              {/* DEPENDENCIES */}

              <div className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Dependencies
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-slate-500">
                      Total
                    </p>

                    <p className="mt-1 text-lg font-semibold text-white">
                      {selectedAnalysis
                        ?.dependencyAnalysis
                        ?.totalDependencies ??
                        0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Production
                    </p>

                    <p className="mt-1 text-lg font-semibold text-white">
                      {selectedAnalysis
                        ?.dependencyAnalysis
                        ?.productionDependencies ??
                        0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Development
                    </p>

                    <p className="mt-1 text-lg font-semibold text-white">
                      {selectedAnalysis
                        ?.dependencyAnalysis
                        ?.developmentDependencies ??
                        0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Vulnerabilities
                    </p>

                    <p className="mt-1 text-lg font-semibold text-red-400">
                      {selectedAnalysis
                        ?.dependencyAnalysis
                        ?.vulnerabilities
                        ?.length ??
                        0}
                    </p>
                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                FINDINGS
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-[#0b111d] p-6">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-semibold">
                    Findings
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Issues detected during static analysis.
                  </p>
                </div>

                <span className="rounded-full border border-slate-800 bg-[#080e19] px-3 py-1 text-xs text-slate-400">
                  {findings.length}{" "}
                  {findings.length ===
                  1
                    ? "finding"
                    : "findings"}
                </span>

              </div>

              {findings.length ===
              0 ? (

                <div className="rounded-xl border border-dashed border-slate-800 bg-[#080e19] p-8 text-center">

                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />

                  <p className="mt-3 text-sm font-medium text-white">
                    No significant issues detected.
                  </p>

                </div>

              ) : (

                <div className="space-y-6">

                  {[
                    "critical",
                    "high",
                    "medium",
                    "low",
                    "info",
                  ].map(
                    (severity) => {

                      const severityFindings =
                        groupedFindings[
                          severity
                        ];

                      if (
                        !severityFindings?.length
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={
                            severity
                          }
                        >

                          <div className="mb-3 flex items-center gap-2">

                            {getSeverityIcon(
                              severity
                            )}

                            <h3 className="text-sm font-bold uppercase tracking-wider">
                              {severity}
                            </h3>

                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                              {
                                severityFindings.length
                              }
                            </span>

                          </div>

                          <div className="space-y-3">

                            {severityFindings.map(
                              (
                                finding
                              ) => {

                                const originalIndex =
                                  findings.indexOf(
                                    finding
                                  );

                                return (
                                  <div
                                    key={
                                      finding._id ||
                                      originalIndex
                                    }
                                    className="rounded-xl border border-slate-800 bg-[#080e19] p-5"
                                  >

                                    <div className="flex gap-4">

                                      <div className="mt-0.5">
                                        {getSeverityIcon(
                                          finding.severity
                                        )}
                                      </div>

                                      <div className="min-w-0 flex-1">

                                        <div className="flex flex-wrap items-center gap-2">

                                          <h4 className="text-sm font-semibold text-white">
                                            {
                                              finding.title
                                            }
                                          </h4>

                                          {finding.category && (
                                            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase text-slate-400">
                                              {
                                                finding.category
                                              }
                                            </span>
                                          )}

                                        </div>

                                        {finding.file && (
                                          <p className="mt-2 font-mono text-xs text-purple-400">
                                            {
                                              finding.file
                                            }

                                            {finding.line
                                              ? `:${finding.line}`
                                              : ""}
                                          </p>
                                        )}

                                        <p className="mt-3 text-sm leading-6 text-slate-400">
                                          {
                                            finding.description
                                          }
                                        </p>

                                        {finding.suggestion && (
                                          <div className="mt-4 rounded-xl border border-purple-500/10 bg-purple-500/5 p-4">

                                            <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                                              Suggested Fix
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                              {
                                                finding.suggestion
                                              }
                                            </p>

                                          </div>
                                        )}

                                        <div className="mt-4 flex flex-wrap justify-end gap-3">

                                          {/* ASK GENOME AI */}

                                          <button
                                            type="button"
                                            disabled={
                                              fixLoading ===
                                              originalIndex
                                            }
                                            onClick={() =>
                                              generateFixSuggestion(
                                                finding,
                                                originalIndex
                                              )
                                            }
                                            className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                          >

                                            {fixLoading ===
                                            originalIndex ? (
                                              <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />

                                                Generating...
                                              </>
                                            ) : (
                                              <>
                                                <Sparkles className="h-4 w-4" />

                                                Ask Genome AI
                                              </>
                                            )}

                                          </button>

                                          {/* CREATE ISSUE */}

                                          {createdIssues[
                                            originalIndex
                                          ] ? (

                                            <button
                                              type="button"
                                              disabled
                                              className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400"
                                            >
                                              <CheckCircle2 className="h-4 w-4" />

                                              Issue Created
                                            </button>

                                          ) : (

                                            <button
                                              type="button"
                                              disabled={
                                                issueLoading ===
                                                originalIndex
                                              }
                                              onClick={() =>
                                                createIssueFromFinding(
                                                  originalIndex
                                                )
                                              }
                                              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            >

                                              {issueLoading ===
                                              originalIndex ? (
                                                <>
                                                  <RefreshCw className="h-4 w-4 animate-spin" />

                                                  Creating...
                                                </>
                                              ) : (
                                                <>
                                                  <Plus className="h-4 w-4" />

                                                  Create Issue
                                                </>
                                              )}

                                            </button>

                                          )}

                                        </div>

                                      </div>

                                    </div>

                                  </div>
                                );
                              }
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </section>

            {/* =================================================
                AI FIX SUGGESTION
            ================================================= */}

            {fixSuggestion && (
              <section className="rounded-2xl border border-purple-500/30 bg-[#0b111d] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
                      <BrainCircuit className="h-5 w-5 text-purple-400" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold">
                        Genome AI — Fix Suggestion
                      </h2>

                      <p className="text-sm text-slate-500">
                        AI-generated guidance for this finding.
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFixSuggestion(
                        null
                      )
                    }
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>

                </div>

                <div className="mt-6 space-y-5">

                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                      Problem
                    </p>

                    <p className="mt-2 text-lg font-semibold text-white">
                      {
                        fixSuggestion
                          ?.finding
                          ?.title
                      }
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {
                        fixSuggestion
                          ?.finding
                          ?.description
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#080e19] p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                      Genome AI Prompt
                    </p>

                    <pre className="mt-3 max-h-[500px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-[#060b14] p-4 text-xs leading-6 text-slate-400">
                      {
                        fixSuggestion?.prompt
                      }
                    </pre>

                  </div>

                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                      Current Status
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      The Fix Suggestion API has prepared
                      structured AI context. Your existing
                      Genome AI provider can use this prompt
                      to generate the final explanation and
                      corrected code.
                    </p>

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                AI REVIEW
            ================================================= */}

            <section className="rounded-2xl border border-purple-500/20 bg-[#0b111d] p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10">
                    <BrainCircuit className="h-6 w-6 text-purple-400" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      Genome AI Review
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      AI-powered repository engineering assessment.
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    generateAIReview
                  }
                  disabled={
                    aiLoading
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {aiLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />

                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />

                      {currentAiReview
                        ? "Regenerate AI Review"
                        : "Generate AI Review"}
                    </>
                  )}

                </button>

              </div>

              {!currentAiReview ? (

                <div className="mt-8 rounded-2xl border border-dashed border-slate-800 bg-[#080e19] p-10 text-center">

                  <BrainCircuit className="mx-auto h-10 w-10 text-purple-400" />

                  <h3 className="mt-4 font-semibold text-white">
                    AI review not generated
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Let Genome AI analyze the
                    engineering scores and findings
                    and provide actionable recommendations.
                  </p>

                </div>

              ) : (

                <div className="mt-8 space-y-7">

                  {/* SUMMARY */}

                  {currentAiReview.summary && (
                    <div className="rounded-xl border border-slate-800 bg-[#080e19] p-5">

                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-purple-400">
                        Summary
                      </p>

                      <p className="text-sm leading-7 text-slate-300">
                        {
                          currentAiReview.summary
                        }
                      </p>

                    </div>
                  )}

                  {/* STRENGTHS */}

                  {currentAiReview
                    .strengths
                    ?.length >
                    0 && (

                    <div>

                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                        Strengths
                      </h3>

                      <div className="space-y-2">

                        {currentAiReview.strengths.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3 text-sm text-emerald-300"
                            >
                              ✓{" "}
                              {item}
                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* WEAKNESSES */}

                  {currentAiReview
                    .weaknesses
                    ?.length >
                    0 && (

                    <div>

                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />

                        Weaknesses
                      </h3>

                      <div className="space-y-2">

                        {currentAiReview.weaknesses.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3 text-sm text-yellow-300"
                            >
                              ⚠{" "}
                              {item}
                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* CRITICAL RISKS */}

                  {currentAiReview
                    .criticalRisks
                    ?.length >
                    0 && (

                    <div>

                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <XCircle className="h-4 w-4 text-red-400" />

                        Critical Risks
                      </h3>

                      <div className="space-y-3">

                        {currentAiReview.criticalRisks.map(
                          (
                            risk,
                            index
                          ) => (
                            <div
                              key={
                                risk._id ||
                                index
                              }
                              className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                            >

                              <div className="flex flex-wrap items-center justify-between gap-3">

                                <h4 className="font-semibold text-white">
                                  {
                                    risk.title
                                  }
                                </h4>

                                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase text-red-400">
                                  {
                                    risk.severity
                                  }
                                </span>

                              </div>

                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {
                                  risk.reason
                                }
                              </p>

                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* RECOMMENDATIONS */}

                  {currentAiReview
                    .recommendations
                    ?.length >
                    0 && (

                    <div>

                      <div className="mb-4">

                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                          <Sparkles className="h-4 w-4 text-purple-400" />

                          Recommendations
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Convert AI recommendations
                          directly into Genome tasks.
                        </p>

                      </div>

                      <div className="space-y-4">

                        {currentAiReview.recommendations.map(
                          (
                            recommendation,
                            index
                          ) => (

                            <div
                              key={
                                recommendation._id ||
                                index
                              }
                              className="rounded-2xl border border-slate-800 bg-[#080e19] p-5"
                            >

                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                <div>

                                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-purple-400">
                                    Recommendation{" "}
                                    {index +
                                      1}
                                  </p>

                                  <h4 className="text-base font-semibold text-white">
                                    {
                                      recommendation.title
                                    }
                                  </h4>

                                </div>

                                <span
                                  className={`w-fit rounded-full border px-3 py-1 text-[10px] font-semibold uppercase ${getPriorityClass(
                                    recommendation.priority
                                  )}`}
                                >
                                  {recommendation.priority ||
                                    "medium"}
                                </span>

                              </div>

                              <div className="mt-5">

                                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-600">
                                  Why it matters
                                </p>

                                <p className="text-sm leading-6 text-slate-400">
                                  {
                                    recommendation.reason
                                  }
                                </p>

                              </div>

                              <div className="mt-4 rounded-xl border border-slate-800 bg-[#060b14] p-4">

                                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-purple-400">
                                  Recommended Action
                                </p>

                                <p className="text-sm leading-6 text-slate-300">
                                  {
                                    recommendation.action
                                  }
                                </p>

                              </div>

                              <div className="mt-5 flex justify-end">

                                {createdTasks[
                                  index
                                ] ? (

                                  <button
                                    type="button"
                                    disabled
                                    className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-400"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />

                                    Task Created
                                  </button>

                                ) : (

                                  <button
                                    type="button"
                                    disabled={
                                      taskLoading ===
                                      index
                                    }
                                    onClick={() =>
                                      createTaskFromRecommendation(
                                        index
                                      )
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                                  >

                                    {taskLoading ===
                                    index ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />

                                        Creating...
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="h-4 w-4" />

                                        Create Task
                                      </>
                                    )}

                                  </button>

                                )}

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* SPECIALIZED REVIEWS */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {[
                      {
                        title:
                          "Architecture Review",

                        value:
                          currentAiReview.architectureReview,
                      },

                      {
                        title:
                          "Security Review",

                        value:
                          currentAiReview.securityReview,
                      },

                      {
                        title:
                          "Testing Review",

                        value:
                          currentAiReview.testingReview,
                      },

                      {
                        title:
                          "Performance Review",

                        value:
                          currentAiReview.performanceReview,
                      },

                      {
                        title:
                          "Documentation Review",

                        value:
                          currentAiReview.documentationReview,
                      },
                    ].map(
                      (review) =>
                        review.value && (
                          <div
                            key={
                              review.title
                            }
                            className="rounded-xl border border-slate-800 bg-[#080e19] p-5"
                          >

                            <h4 className="text-sm font-semibold text-white">
                              {
                                review.title
                              }
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {
                                review.value
                              }
                            </p>

                          </div>
                        )
                    )}

                  </div>

                </div>

              )}

            </section>

            {/* =================================================
                DELETE
            ================================================= */}

            <div className="flex justify-end">

              <button
                type="button"
                onClick={() =>
                  deleteAnalysis(
                    selectedAnalysis._id
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />

                Delete Analysis
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CodeLab;