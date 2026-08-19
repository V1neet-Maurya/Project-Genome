import { useEffect, useState } from "react";

import ErrorState from "../components/ErrorState";

import { getAnalytics } from "../services/analyticsApi";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAnalytics();

      setAnalytics(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] p-8 text-white">
        Loading Analytics...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b14] p-8 text-white">
        <ErrorState
          message={error}
          onRetry={fetchAnalytics}
        />
      </div>
    );
  }

  // =====================================================
  // NO DATA
  // =====================================================

  if (!analytics) {
    return (
      <div className="min-h-screen bg-[#070b14] p-8 text-white">
        <ErrorState
          message="Unable to load analytics"
          onRetry={fetchAnalytics}
        />
      </div>
    );
  }

  const {
    projects,
    tasks,
    issues,
    projectProgress,
  } = analytics;

  return (
    <div className="min-h-screen bg-[#070b14] p-6 text-white md:p-8">

      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}

        <div className="mb-8">

          <p className="mb-2 text-sm text-purple-400">
            Workspace
          </p>

          <h1 className="text-3xl font-bold">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track your projects, tasks and issues.
          </p>

        </div>

        {/* STAT CARDS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">

            <p className="text-sm text-slate-500">
              Total Projects
            </p>

            <p className="mt-3 text-3xl font-bold">
              {projects.total}
            </p>

          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">

            <p className="text-sm text-slate-500">
              Total Tasks
            </p>

            <p className="mt-3 text-3xl font-bold">
              {tasks.total}
            </p>

          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">

            <p className="text-sm text-slate-500">
              Completed Tasks
            </p>

            <p className="mt-3 text-3xl font-bold">
              {tasks.completed}
            </p>

          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">

            <p className="text-sm text-slate-500">
              Total Issues
            </p>

            <p className="mt-3 text-3xl font-bold">
              {issues.total}
            </p>

          </div>

        </div>

        {/* TASK STATUS */}

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-6">

          <h2 className="text-lg font-semibold">
            Task Status
          </h2>

          <div className="mt-5 space-y-4">

            {[
              ["Todo", tasks.todo],
              ["In Progress", tasks.inProgress],
              ["Review", tasks.review],
              ["Completed", tasks.completed],
            ].map(([label, value]) => {

              const percentage =
                tasks.total === 0
                  ? 0
                  : Math.round(
                      (value / tasks.total) * 100
                    );

              return (
                <div key={label}>

                  <div className="mb-2 flex justify-between text-sm">

                    <span className="text-slate-400">
                      {label}
                    </span>

                    <span>
                      {value}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">

                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* PROJECT PROGRESS */}

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-6">

          <h2 className="text-lg font-semibold">
            Project Progress
          </h2>

          <div className="mt-5 space-y-6">

            {projectProgress.map((project) => (

              <div key={project._id}>

                <div className="mb-2 flex justify-between">

                  <span className="text-sm font-medium">
                    {project.name}
                  </span>

                  <span className="text-sm text-slate-400">
                    {project.progress}%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{
                      width: `${project.progress}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-xs text-slate-600">
                  {project.completedTasks} of{" "}
                  {project.totalTasks} tasks completed
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Analytics;