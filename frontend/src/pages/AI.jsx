import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileText,
  Lightbulb,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import api from "../services/api";

const quickActions = [
  {
    title: "Find blockers",
    description: "Identify what's stopping the project",
    icon: CircleAlert,
    prompt:
      "What is currently blocking this project? Identify the most important blockers and explain their impact.",
  },
  {
    title: "Project summary",
    description: "Get a concise project overview",
    icon: FileText,
    prompt:
      "Give me a concise summary of this project including progress, tasks, issues, and the most important concerns.",
  },
  {
    title: "Prioritize work",
    description: "Find what should be done next",
    icon: CheckCircle2,
    prompt:
      "Which tasks should the team prioritize next? Consider priority, status, blockers, and project impact.",
  },
  {
    title: "Analyze workload",
    description: "Review the team's workload",
    icon: Users,
    prompt:
      "Analyze the current team workload and identify anyone who appears overloaded or underutilized.",
  },
  {
    title: "Deadline risk",
    description: "Check schedule problems",
    icon: CalendarClock,
    prompt:
      "Analyze the project's deadline risk based on the current tasks, statuses, priorities, and available deadline information.",
  },
  {
    title: "Analyze issues",
    description: "Find the most important issues",
    icon: CircleAlert,
    prompt:
      "Analyze the project's open issues and identify the most serious issues and their potential impact.",
  },
];

const AI = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] =
    useState("");

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingAI, setLoadingAI] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showProjectMenu, setShowProjectMenu] =
    useState(false);

  const selectedProjectData = useMemo(
    () =>
      projects.find(
        (project) =>
          String(project._id) ===
          String(selectedProject)
      ),
    [projects, selectedProject]
  );

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");

      const response =
        await api.get("/projects");

      const projectData =
        response.data?.data || [];

      setProjects(projectData);

      if (projectData.length > 0) {
        setSelectedProject(
          projectData[0]._id
        );
      }
    } catch (err) {
      console.error(
        "Failed to load projects:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load projects"
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // =====================================================
  // ASK GENOME
  // =====================================================

  const askGenome = async (
    customQuestion = null
  ) => {
    const finalQuestion =
      customQuestion ?? question;

    if (!finalQuestion.trim()) {
      return;
    }

    if (!selectedProject) {
      setError(
        "Please select a project first."
      );
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: finalQuestion.trim(),
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setError("");
    setLoadingAI(true);

    try {
      const response = await api.post(
        "/ai/ask",
        {
          projectId: selectedProject,
          question: finalQuestion.trim(),
        }
      );

      const answer =
        response.data?.data?.answer ||
        "I couldn't generate an answer.";

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: answer,
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);
    } catch (err) {
      console.error(
        "Genome AI error:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Genome AI could not process your request.";

      setError(message);
    } finally {
      setLoadingAI(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!loadingAI) {
        askGenome();
      }
    }
  };

  // =====================================================
  // QUICK ACTION
  // =====================================================

  const handleQuickAction = (action) => {
    askGenome(action.prompt);
  };

  // =====================================================
  // CLEAR CHAT
  // =====================================================

  const clearConversation = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">
                <BrainCircuit
                  size={22}
                  className="text-purple-400"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Genome AI
                  </h1>

                  <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
                    Gemini
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Your intelligent project management
                  assistant.
                </p>
              </div>

            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X size={16} />
              Clear chat
            </button>
          )}

        </div>

        {/* ================================================= */}
        {/* PROJECT SELECTOR */}
        {/* ================================================= */}

        <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-4 shadow-xl shadow-black/10">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
                <Sparkles
                  size={17}
                  className="text-purple-400"
                />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Project context
                </p>

                <p className="mt-0.5 text-sm text-slate-300">
                  Gemini will analyze data from
                  this project.
                </p>
              </div>

            </div>

            {/* PROJECT SELECTOR */}

            <div className="relative w-full sm:w-[280px]">

              <button
                type="button"
                disabled={loadingProjects}
                onClick={() =>
                  setShowProjectMenu(
                    (previous) =>
                      !previous
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-[#080c15] px-4 py-3 text-left transition hover:border-purple-500/30"
              >

                <div className="min-w-0">

                  <p className="truncate text-sm font-medium text-white">
                    {loadingProjects
                      ? "Loading projects..."
                      : selectedProjectData?.name ||
                        "Select project"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Project data
                  </p>

                </div>

                <ChevronDown
                  size={16}
                  className="shrink-0 text-slate-500"
                />

              </button>

              {showProjectMenu && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-30 max-h-64 w-full overflow-y-auto rounded-xl border border-white/[0.08] bg-[#101722] p-1.5 shadow-2xl">

                  {projects.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-slate-500">
                      No projects available
                    </div>
                  ) : (
                    projects.map((project) => (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => {
                          setSelectedProject(
                            project._id
                          );

                          setShowProjectMenu(
                            false
                          );

                          setMessages([]);
                          setError("");
                        }}
                        className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
                          String(
                            selectedProject
                          ) ===
                          String(project._id)
                            ? "bg-purple-500/10 text-purple-300"
                            : "text-slate-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        <p className="truncate text-sm font-medium">
                          {project.name}
                        </p>

                        {project.description && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {project.description}
                          </p>
                        )}
                      </button>
                    ))
                  )}

                </div>
              )}

            </div>

          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3.5">

            <CircleAlert
              size={18}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="text-sm font-medium text-red-300">
                Genome AI
              </p>

              <p className="mt-1 text-xs leading-5 text-red-300/70">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* MAIN GRID */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">

          {/* ================================================= */}
          {/* CHAT PANEL */}
          {/* ================================================= */}

          <section className="flex min-h-[650px] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1320] shadow-xl shadow-black/10">

            {/* CHAT HEADER */}

            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">

                  <Bot
                    size={19}
                    className="text-purple-400"
                  />

                  <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0d1320]" />

                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Project Assistant
                  </p>

                  <p className="text-xs text-slate-500">
                    {selectedProjectData?.name ||
                      "Select a project"}
                  </p>
                </div>

              </div>

              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/[0.05] px-3 py-1.5 sm:flex">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[11px] text-emerald-300">
                  Ready
                </span>

              </div>

            </div>

            {/* CHAT BODY */}

            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">

              {messages.length === 0 ? (
                <div className="flex min-h-[500px] items-center justify-center">

                  <div className="max-w-xl text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">

                      <Sparkles
                        size={28}
                        className="text-purple-400"
                      />

                    </div>

                    <h2 className="mt-5 text-xl font-semibold">
                      What can I help you with?
                    </h2>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                      Ask Genome about your project,
                      tasks, issues, workload, deadlines,
                      blockers, or anything else related
                      to your project data.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">

                      {[
                        "What is blocking my project?",
                        "Summarize my project",
                        "What should I prioritize?",
                      ].map((text) => (
                        <button
                          key={text}
                          type="button"
                          disabled={!selectedProject}
                          onClick={() =>
                            askGenome(text)
                          }
                          className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs text-slate-400 transition hover:border-purple-500/20 hover:bg-purple-500/[0.05] hover:text-purple-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {text}
                        </button>
                      ))}

                    </div>

                  </div>

                </div>
              ) : (
                <div className="mx-auto max-w-4xl space-y-6">

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role ===
                        "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      {message.role ===
                        "assistant" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                          <Bot
                            size={17}
                            className="text-purple-400"
                          />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role ===
                          "user"
                            ? "rounded-br-md bg-purple-600 text-white"
                            : "rounded-bl-md border border-white/[0.07] bg-white/[0.025] text-slate-300"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {message.content}
                        </p>
                      </div>

                    </div>
                  ))}

                  {loadingAI && (
                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                        <Bot
                          size={17}
                          className="text-purple-400"
                        />
                      </div>

                      <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.025] px-4 py-3">

                        <div className="flex items-center gap-2">

                          <Loader2
                            size={15}
                            className="animate-spin text-purple-400"
                          />

                          <span className="text-sm text-slate-500">
                            Genome is analyzing...
                          </span>

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* INPUT */}

            <div className="border-t border-white/[0.07] p-4 sm:p-5">

              <div className="mx-auto max-w-4xl">

                <div className="relative rounded-2xl border border-white/[0.08] bg-[#080c15] transition focus-within:border-purple-500/30">

                  <textarea
                    value={question}
                    onChange={(event) =>
                      setQuestion(
                        event.target.value
                      )
                    }
                    onKeyDown={handleKeyDown}
                    disabled={
                      loadingAI ||
                      !selectedProject
                    }
                    rows={3}
                    placeholder={
                      selectedProject
                        ? "Ask Genome anything about this project..."
                        : "Select a project first..."
                    }
                    className="w-full resize-none bg-transparent px-4 pb-14 pt-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
                  />

                  <div className="absolute bottom-3 left-4 text-[11px] text-slate-600">
                    Enter to send · Shift + Enter
                    for new line
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      askGenome()
                    }
                    disabled={
                      loadingAI ||
                      !selectedProject ||
                      !question.trim()
                    }
                    className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loadingAI ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-center text-[10px] text-slate-600">
                  Genome AI analyzes data from the
                  selected project.
                </p>

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================================= */}

          <aside>

            <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-4 shadow-xl shadow-black/10">

              <div className="mb-4 flex items-center gap-2">

                <Lightbulb
                  size={17}
                  className="text-purple-400"
                />

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Quick analysis
                  </h3>

                  <p className="text-xs text-slate-500">
                    Ask Genome common questions
                  </p>
                </div>

              </div>

              <div className="space-y-2">

                {quickActions.map(
                  (action) => {
                    const Icon =
                      action.icon;

                    return (
                      <button
                        key={action.title}
                        type="button"
                        disabled={
                          loadingAI ||
                          !selectedProject
                        }
                        onClick={() =>
                          handleQuickAction(
                            action
                          )
                        }
                        className="group flex w-full items-start gap-3 rounded-xl border border-transparent bg-white/[0.02] p-3 text-left transition hover:border-purple-500/10 hover:bg-purple-500/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                      >

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] transition group-hover:bg-purple-500/10">

                          <Icon
                            size={16}
                            className="text-slate-400 group-hover:text-purple-400"
                          />

                        </div>

                        <div className="min-w-0">

                          <p className="text-xs font-medium text-slate-200">
                            {action.title}
                          </p>

                          <p className="mt-1 text-[11px] leading-4 text-slate-600">
                            {action.description}
                          </p>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* CONTEXT CARD */}

            <div className="mt-4 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-4">

              <div className="flex items-center gap-2">

                <Clock3
                  size={16}
                  className="text-purple-400"
                />

                <p className="text-xs font-semibold text-slate-300">
                  AI context
                </p>

              </div>

              <div className="mt-4 space-y-3">

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Project
                  </span>

                  <span className="max-w-[160px] truncate text-xs font-medium text-slate-300">
                    {selectedProjectData?.name ||
                      "—"}
                  </span>
                </div>

                <div className="h-px bg-white/[0.05]" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    AI model
                  </span>

                  <span className="text-xs font-medium text-purple-300">
                    Gemini
                  </span>
                </div>

                <div className="h-px bg-white/[0.05]" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Status
                  </span>

                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                </div>

              </div>

            </div>

            {/* TIP */}

            <div className="mt-4 rounded-2xl border border-purple-500/10 bg-purple-500/[0.04] p-4">

              <div className="flex gap-3">

                <Sparkles
                  size={17}
                  className="mt-0.5 shrink-0 text-purple-400"
                />

                <div>
                  <p className="text-xs font-semibold text-purple-300">
                    Tip
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Ask specific questions such as
                    "Which high-priority tasks are
                    blocked?" for better analysis.
                  </p>
                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>
    </div>
  );
};

export default AI;