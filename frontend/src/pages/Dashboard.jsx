import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  ArrowUpRight,
  Bug,
  CheckCircle2,
  FolderKanban,
  ListChecks,
  Users,
  RefreshCw,
} from "lucide-react";

import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { getDashboardData } from "../services/dashboardApi";

// =====================================================
// STAT CARD
// =====================================================

const Stat = ({
  icon: Icon,
  title,
  value,
  change,
  positive = true,
  cls,
}) => {
  return (
    <div className="glass min-w-0 rounded-2xl p-5">
      <div className="flex items-center gap-4">

        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${cls}`}
        >
          <Icon size={25} />
        </div>

        <div className="min-w-0">

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-2xl font-semibold text-white">
            {value}
          </p>

          <p
            className={`mt-1 text-xs ${
              positive
                ? "text-emerald-400"
                : "text-rose-400"
            }`}
          >
            {change}
          </p>

        </div>

      </div>
    </div>
  );
};

// =====================================================
// CARD
// =====================================================

const Card = ({
  title,
  children,
  action,
}) => {
  return (
    <section className="glass min-w-0 rounded-2xl p-5">

      <div className="mb-5 flex min-w-0 items-center justify-between gap-3">

        <h2 className="truncate font-semibold text-white">
          {title}
        </h2>

        {action}

      </div>

      {children}

    </section>
  );
};

// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (date) => {
  if (!date) {
    return "No due date";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
};

// =====================================================
// TASK STATUS LABEL
// =====================================================

const getTaskStatusLabel = (status) => {
  switch (status) {
    case "todo":
      return "To Do";

    case "in-progress":
      return "In Progress";

    case "in-review":
      return "In Review";

    case "completed":
      return "Completed";

    default:
      return status || "Unknown";
  }
};

// =====================================================
// DASHBOARD
// =====================================================

export default function Dashboard() {

  const navigate = useNavigate();

  // ===================================================
  // LOGGED-IN USER
  // ===================================================

  const user = useSelector(
    (state) => state.user.user
  );

  // ===================================================
  // DASHBOARD STATE
  // ===================================================

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // FETCH DASHBOARD
  // ===================================================

  const fetchDashboard = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getDashboardData();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to load dashboard"
        );
      }

      setDashboard(
        response?.data || {}
      );

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load dashboard"
      );

    } finally {

      setLoading(false);

    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <div className="min-h-full p-4 sm:p-6">

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-violet-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              Loading dashboard...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error) {

    return (
      <div className="min-h-full p-4 sm:p-6">

        <div className="mx-auto max-w-lg rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">

          <p className="text-sm text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ===================================================
  // SAFE DATA
  // ===================================================

  const stats =
    dashboard?.stats || {};

  const taskStats =
    dashboard?.tasks || {};

  const issueStats =
    dashboard?.issues || {};

  const projects =
    Array.isArray(dashboard?.projects)
      ? dashboard.projects
      : [];

  const recentTasks =
    Array.isArray(dashboard?.recentTasks)
      ? dashboard.recentTasks
      : [];

  const recentIssues =
    Array.isArray(dashboard?.recentIssues)
      ? dashboard.recentIssues
      : [];

  // ===================================================
  // TASK PIE DATA
  // ===================================================

  const pieData = [
    {
      name: "To Do",
      value: Number(taskStats.todo) || 0,
    },
    {
      name: "In Progress",
      value:
        Number(taskStats.inProgress) || 0,
    },
    {
      name: "In Review",
      value:
        Number(taskStats.inReview) || 0,
    },
    {
      name: "Completed",
      value:
        Number(taskStats.completed) || 0,
    },
  ];

  const pieColors = [
    "#8b5cf6",
    "#3b82f6",
    "#f59e0b",
    "#22c55e",
  ];

  const totalTasks =
    Number(stats.tasks) || 0;

  // ===================================================
  // CHART DATA
  // ===================================================

  const chartData = [
    {
      name: "To Do",
      tasks:
        Number(taskStats.todo) || 0,
      issues:
        Number(issueStats.open) || 0,
    },

    {
      name: "Progress",
      tasks:
        Number(taskStats.inProgress) || 0,
      issues:
        Number(issueStats.inProgress) || 0,
    },

    {
      name: "Review",
      tasks:
        Number(taskStats.inReview) || 0,
      issues:
        Number(issueStats.resolved) || 0,
    },

    {
      name: "Completed",
      tasks:
        Number(taskStats.completed) || 0,
      issues:
        Number(issueStats.closed) || 0,
    },
  ];

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-w-0 p-4 sm:p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-7 flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div className="min-w-0">

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Good morning,{" "}
            {user?.firstName || "there"} 👋
          </h1>

          <p className="mt-1 text-sm text-slate-400 sm:text-base">
            Here's what's happening across
            your workspace.
          </p>

        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white sm:w-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <Stat
          icon={FolderKanban}
          title="Projects"
          value={stats.projects || 0}
          change="Active projects"
          cls="bg-violet-600/90 text-white"
        />

        <Stat
          icon={ListChecks}
          title="Tasks"
          value={stats.tasks || 0}
          change={`${stats.completedTasks || 0} completed`}
          cls="bg-blue-600/90 text-white"
        />

        <Stat
          icon={Bug}
          title="Issues"
          value={stats.issues || 0}
          change={`${stats.openIssues || 0} open`}
          positive={
            (stats.openIssues || 0) === 0
          }
          cls="bg-orange-500/90 text-white"
        />

        <Stat
          icon={Users}
          title="Team Members"
          value={stats.teamMembers || 0}
          change="People in your projects"
          cls="bg-emerald-500/90 text-white"
        />

      </div>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">

        <button
          type="button"
          onClick={() =>
            navigate("/projects")
          }
          className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5 text-left transition hover:border-purple-500/30 hover:bg-purple-500/[0.03]"
        >
          <p className="text-sm font-semibold text-white">
            Create Project
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Start a new project
          </p>

        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/tasks")
          }
          className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5 text-left transition hover:border-purple-500/30 hover:bg-purple-500/[0.03]"
        >
          <p className="text-sm font-semibold text-white">
            View Tasks
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Manage your work
          </p>

        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/issues")
          }
          className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5 text-left transition hover:border-purple-500/30 hover:bg-purple-500/[0.03]"
        >
          <p className="text-sm font-semibold text-white">
            View Issues
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Check problems and bugs
          </p>

        </button>

      </div>

      {/* =================================================
          FIRST ROW
      ================================================= */}

      <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[1.55fr_.9fr_.95fr]">

        {/* PROJECT OVERVIEW */}

        <Card title="Project Overview">

          <div className="h-[300px] min-w-0">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={chartData}
                margin={{
                  left: -20,
                  right: 10,
                  top: 5,
                  bottom: 0,
                }}
              >

                <defs>

                  <linearGradient
                    id="purple"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#8b5cf6"
                      stopOpacity=".25"
                    />

                    <stop
                      offset="100%"
                      stopColor="#8b5cf6"
                      stopOpacity="0"
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  stroke="#263148"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />

                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />

                <Tooltip
                  contentStyle={{
                    background: "#101827",
                    border:
                      "1px solid #29344a",
                    borderRadius: 12,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#8b5cf6"
                  fill="url(#purple)"
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="issues"
                  stroke="#22c55e"
                  fill="transparent"
                  strokeWidth={2}
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </Card>

        {/* =================================================
            PROJECT PROGRESS
        ================================================= */}

        <Card title="Project Progress">

          <div className="space-y-5">

            {projects.length === 0 ? (

              <p className="text-sm text-slate-500">
                No projects found.
              </p>

            ) : (

              projects.map((project) => {

                // IMPORTANT:
                // Use the progress calculated by
                // dashboardController.js

                const progress = Math.min(
                  100,
                  Math.max(
                    0,
                    Number(project.progress) || 0
                  )
                );

                return (
                  <div
                    key={project._id}
                    className="min-w-0"
                  >

                    <div className="mb-2 flex min-w-0 justify-between text-sm">

                      <span className="min-w-0 truncate text-white">
                        {project.name}
                      </span>

                      <span className="ml-3 shrink-0 text-slate-400">
                        {progress}%
                      </span>

                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className="h-full rounded-full bg-violet-500 transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              })

            )}

          </div>

        </Card>

        {/* =================================================
            UPCOMING DEADLINES
        ================================================= */}

        <Card title="Upcoming Deadlines">

          <div className="space-y-4">

            {recentTasks
              .filter(
                (task) => task.dueDate
              )
              .sort(
                (a, b) =>
                  new Date(a.dueDate) -
                  new Date(b.dueDate)
              )
              .slice(0, 4)
              .map((task) => (

                <div
                  key={task._id}
                  className="flex min-w-0 items-center gap-3 border-b border-white/5 pb-4 last:border-0"
                >

                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/10 text-center">

                    <span className="text-[9px] text-slate-500">
                      DUE
                    </span>

                    <b>
                      {new Date(
                        task.dueDate
                      ).getDate()}
                    </b>

                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-white">

                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-violet-500" />

                      {task.title}

                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">

                      {task.project?.name ||
                        "Project"}

                      {" · "}

                      {formatDate(
                        task.dueDate
                      )}

                    </p>

                  </div>

                </div>

              ))}

            {recentTasks.filter(
              (task) => task.dueDate
            ).length === 0 && (

              <p className="text-sm text-slate-500">
                No upcoming deadlines.
              </p>

            )}

          </div>

        </Card>

      </div>

      {/* =================================================
          SECOND ROW
      ================================================= */}

      <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[1.1fr_1.1fr_.95fr]">

        {/* TASK STATUS */}

        <Card title="Task Status">

          <div className="flex min-w-0 flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-7">

            <div className="h-48 w-48 shrink-0">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={58}
                    outerRadius={76}
                    paddingAngle={2}
                  >

                    {pieData.map(
                      (item, index) => (
                        <Cell
                          key={item.name}
                          fill={
                            pieColors[index]
                          }
                        />
                      )
                    )}

                  </Pie>

                </PieChart>

              </ResponsiveContainer>

              <div className="-mt-[116px] text-center">

                <b className="text-2xl">
                  {totalTasks}
                </b>

                <p className="text-xs text-slate-500">
                  Total
                </p>

              </div>

            </div>

            <div className="w-full min-w-0 flex-1 space-y-4 sm:w-auto">

              {pieData.map(
                (item, index) => (

                  <div
                    key={item.name}
                    className="flex min-w-0 items-center justify-between gap-3 text-sm"
                  >

                    <span className="flex min-w-0 items-center gap-2">

                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          background:
                            pieColors[index],
                        }}
                      />

                      <span className="truncate">
                        {item.name}
                      </span>

                    </span>

                    <span className="shrink-0 text-slate-400">

                      {item.value}

                      {" ("}

                      {totalTasks === 0
                        ? 0
                        : Math.round(
                            (item.value /
                              totalTasks) *
                              100
                          )}

                      {"%)"}

                    </span>

                  </div>

                )
              )}

            </div>

          </div>

        </Card>

        {/* =================================================
            PROJECTS
        ================================================= */}

        <Card title="Projects">

          <div className="space-y-1">

            {projects.length === 0 ? (

              <p className="py-5 text-sm text-slate-500">
                No projects found.
              </p>

            ) : (

              projects.map(
                (project) => (

                  <button
                    type="button"
                    key={project._id}
                    onClick={() =>
                      navigate("/projects")
                    }
                    className="flex w-full min-w-0 items-center gap-3 border-b border-white/5 py-3 text-left last:border-0 hover:bg-white/[0.02]"
                  >

                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500 text-white">

                      <FolderKanban
                        size={17}
                      />

                    </div>

                    <span className="min-w-0 flex-1 truncate text-sm text-white">
                      {project.name}
                    </span>

                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-slate-500"
                    />

                  </button>

                )
              )

            )}

          </div>

        </Card>

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <Card title="Recent Activity">

          <div className="space-y-4">

            {recentTasks
              .slice(0, 3)
              .map((task) => (

                <div
                  key={`task-${task._id}`}
                  className="flex min-w-0 gap-3"
                >

                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5">

                    <CheckCircle2
                      size={17}
                      className="text-emerald-400"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs text-slate-300">
                      <b>Task</b>{" "}
                      {getTaskStatusLabel(
                        task.status
                      )}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {task.title}
                    </p>

                  </div>

                </div>

              ))}

            {recentIssues
              .slice(0, 2)
              .map((issue) => (

                <div
                  key={`issue-${issue._id}`}
                  className="flex min-w-0 gap-3"
                >

                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5">

                    <Bug
                      size={17}
                      className="text-rose-400"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs text-slate-300">
                      <b>Issue</b>{" "}
                      {issue.status}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {issue.title}
                    </p>

                  </div>

                </div>

              ))}

            {recentTasks.length === 0 &&
              recentIssues.length === 0 && (

                <p className="text-sm text-slate-500">
                  No recent activity.
                </p>

              )}

          </div>

        </Card>

      </div>

    </div>
  );
}