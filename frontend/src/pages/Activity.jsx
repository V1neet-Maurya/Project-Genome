


import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import { getActivities } from "../services/activityApi";

import {
  setActivities,
  setLoading,
  setError,
} from "../redux/activitySlice";

const Activity = () => {
  const dispatch = useDispatch();

  const {
    activities,
    loading,
    error,
  } = useSelector(
    (state) => state.activity
  );

  const fetchActivities = async () => {
    try {
      dispatch(
        setLoading(true)
      );

      dispatch(
        setError(null)
      );

      const response =
        await getActivities();

      dispatch(
        setActivities(
          response.data || []
        )
      );
    } catch (error) {
      const message =
        error.response?.data
          ?.message ||
        "Failed to load activity";

      dispatch(
        setError(message)
      );
    } finally {
      dispatch(
        setLoading(false)
      );
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white">

        <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">

          <div className="flex min-h-[400px] items-center justify-center text-slate-400">
            Loading...
          </div>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white">

        <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">

          <ErrorState
            message={error}
            onRetry={fetchActivities}
          />

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">

        <div className="mb-8">

          <p className="text-sm font-medium text-purple-400">
            Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Activity
          </h1>

          <p className="mt-2 text-slate-400">
            See what has happened across
            your projects.
          </p>

        </div>

        {activities.length === 0 ? (
          <EmptyState
            icon="•"
            title="No activity yet"
            description="Activity will appear here as your team works."
          />
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320]">

            {activities.map(
              (activity, index) => (
                <div
                  key={activity._id}
                  className={`flex gap-4 px-6 py-5 ${
                    index !==
                    activities.length - 1
                      ? "border-b border-white/[0.06]"
                      : ""
                  }`}
                >

                  {/* ICON */}

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                    {activity.entityType ===
                    "task"
                      ? "✓"
                      : activity.entityType ===
                        "issue"
                      ? "!"
                      : activity.entityType ===
                        "document"
                      ? "📄"
                      : "•"}
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0">

                    <p className="text-sm text-slate-200">
                      {activity.message}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">

                      <span>
                        {activity.project
                          ?.name ||
                          "Project"}
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        {new Date(
                          activity.createdAt
                        ).toLocaleString()}
                      </span>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default Activity;