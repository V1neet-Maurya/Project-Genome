import React, { useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

const AITaskGenerator = ({
  projectId,
  token,
}) => {
  const [prompt, setPrompt] =
    useState("");

  const [plan, setPlan] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // SELECTED TASKS
  // =====================================================

  const [selectedTasks, setSelectedTasks] =
    useState({});

  // =====================================================
  // TOGGLE TASK
  // =====================================================

  const toggleTask = (
    milestoneIndex,
    taskIndex
  ) => {
    const key =
      `${milestoneIndex}-${taskIndex}`;

    setSelectedTasks(
      (previous) => ({
        ...previous,
        [key]:
          !previous[key],
      })
    );
  };

  // =====================================================
  // GENERATE AI PLAN
  // =====================================================

  const generatePlan = async () => {
    try {
      if (!projectId) {
        alert(
          "Please select a project first."
        );
        return;
      }

      if (!prompt.trim()) {
        alert(
          "Please enter a project prompt."
        );
        return;
      }

      setLoading(true);
      setError("");
      setPlan(null);
      setSelectedTasks({});

      const response =
        await axios.post(
          `${API_URL}/api/v1/ai/task-generation/project/${projectId}`,
          {
            prompt:
              prompt.trim(),
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      setPlan(
        response.data?.data
      );
    } catch (error) {
      console.error(
        "Failed to generate AI plan:",
        error
      );

      const message =
        error.response?.data
          ?.message ||
        "Failed to generate AI task plan";

      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CREATE SELECTED PLAN
  // =====================================================

  const createSelectedPlan =
    async () => {
      try {
        if (!projectId) {
          alert(
            "Please select a project first."
          );
          return;
        }

        if (!plan?.milestones) {
          alert(
            "Generate an AI plan first."
          );
          return;
        }

        // -----------------------------------------------
        // GET ONLY SELECTED TASKS
        // -----------------------------------------------

        const selectedMilestones =
          plan.milestones
            .map(
              (
                milestone,
                milestoneIndex
              ) => {
                const tasks =
                  (
                    milestone.tasks ||
                    []
                  ).filter(
                    (
                      task,
                      taskIndex
                    ) =>
                      selectedTasks[
                        `${milestoneIndex}-${taskIndex}`
                      ]
                  );

                return {
                  ...milestone,
                  tasks,
                };
              }
            )
            .filter(
              (milestone) =>
                milestone.tasks
                  .length > 0
            );

        // -----------------------------------------------
        // VALIDATE SELECTION
        // -----------------------------------------------

        if (
          selectedMilestones.length ===
          0
        ) {
          alert(
            "Select at least one task."
          );
          return;
        }

        setCreating(true);

        // -----------------------------------------------
        // CREATE IN GENOME
        // -----------------------------------------------

        const response =
          await axios.post(
            `${API_URL}/api/v1/ai/task-generation/accept`,
            {
              projectId,

              milestones:
                selectedMilestones,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        console.log(
          "AI plan created:",
          response.data
        );

        const taskCount =
          response.data?.data
            ?.taskCount || 0;

        const milestoneCount =
          response.data?.data
            ?.milestoneCount || 0;

        alert(
          `Created ${taskCount} tasks and ${milestoneCount} milestone${
            milestoneCount !== 1
              ? "s"
              : ""
          } successfully`
        );

        // -----------------------------------------------
        // CLEAR SELECTION
        // -----------------------------------------------

        setSelectedTasks({});

      } catch (error) {
        console.error(
          "Failed to create AI plan:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Failed to create project plan"
        );
      } finally {
        setCreating(false);
      }
    };

  // =====================================================
  // SELECT ALL TASKS
  // =====================================================

  const selectAllTasks = () => {
    if (!plan?.milestones) {
      return;
    }

    const allSelected = {};

    plan.milestones.forEach(
      (milestone, milestoneIndex) => {
        (
          milestone.tasks || []
        ).forEach(
          (
            task,
            taskIndex
          ) => {
            allSelected[
              `${milestoneIndex}-${taskIndex}`
            ] = true;
          }
        );
      }
    );

    setSelectedTasks(
      allSelected
    );
  };

  // =====================================================
  // CLEAR ALL TASKS
  // =====================================================

  const clearAllTasks = () => {
    setSelectedTasks({});
  };

  // =====================================================
  // COUNT SELECTED TASKS
  // =====================================================

  const selectedTaskCount =
    Object.values(
      selectedTasks
    ).filter(Boolean).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="w-full space-y-6">

      {/* =================================================
          AI INPUT
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold text-slate-900">
          AI Task Generator
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Describe what you want to build and
          Genome AI will create a structured
          project plan.
        </p>

        <textarea
          value={prompt}
          onChange={(e) =>
            setPrompt(
              e.target.value
            )
          }
          placeholder="Example: Build a food delivery application with authentication, restaurants, cart, orders and online payments"
          className="mt-5 min-h-[140px] w-full rounded-xl border border-slate-200 p-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        <button
          type="button"
          onClick={generatePlan}
          disabled={loading}
          className="mt-4 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Generating AI Plan..."
            : "Generate AI Plan"}
        </button>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* =================================================
          AI GENERATED PLAN
      ================================================= */}

      {plan && (
        <div className="space-y-6">

          {/* -----------------------------------------------
              PROJECT SUMMARY
          ----------------------------------------------- */}

          {plan.projectSummary && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">

              <h2 className="text-lg font-bold text-indigo-900">
                Project Summary
              </h2>

              <p className="mt-2 text-sm leading-6 text-indigo-700">
                {plan.projectSummary}
              </p>
            </div>
          )}

          {/* -----------------------------------------------
              SELECTION CONTROLS
          ----------------------------------------------- */}

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Generated Project Plan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedTaskCount} task
                {selectedTaskCount !== 1
                  ? "s"
                  : ""} selected
              </p>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={
                  selectAllTasks
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={
                  clearAllTasks
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear All
              </button>

            </div>
          </div>

          {/* -----------------------------------------------
              MILESTONES
          ----------------------------------------------- */}

          <div className="space-y-6">

            {plan.milestones?.map(
              (
                milestone,
                milestoneIndex
              ) => (
                <div
                  key={
                    milestone._id ||
                    milestoneIndex
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  {/* MILESTONE HEADER */}

                  <div className="mb-5">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <h2 className="text-lg font-bold text-slate-900">
                        {milestone.title}
                      </h2>

                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                        Milestone{" "}
                        {milestoneIndex +
                          1}
                      </span>

                    </div>

                    {milestone.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {
                          milestone.description
                        }
                      </p>
                    )}

                  </div>

                  {/* TASKS */}

                  <div className="space-y-3">

                    {milestone.tasks?.map(
                      (
                        task,
                        taskIndex
                      ) => {

                        const key =
                          `${milestoneIndex}-${taskIndex}`;

                        const selected =
                          selectedTasks[
                            key
                          ];

                        return (
                          <div
                            key={
                              task._id ||
                              taskIndex
                            }
                            className={`rounded-xl border p-4 transition ${
                              selected
                                ? "border-indigo-300 bg-indigo-50/50"
                                : "border-slate-200 bg-white"
                            }`}
                          >

                            <div className="flex gap-4">

                              <input
                                type="checkbox"
                                checked={
                                  !!selected
                                }
                                onChange={() =>
                                  toggleTask(
                                    milestoneIndex,
                                    taskIndex
                                  )
                                }
                                className="mt-1 h-5 w-5 cursor-pointer"
                              />

                              <div className="flex-1">

                                <div className="flex flex-wrap items-center justify-between gap-3">

                                  <h3 className="font-semibold text-slate-900">
                                    {
                                      task.title
                                    }
                                  </h3>

                                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium capitalize text-indigo-600">
                                    {
                                      task.priority
                                    }
                                  </span>

                                </div>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  {
                                    task.description
                                  }
                                </p>

                                {task.estimatedHours !==
                                  undefined && (
                                  <p className="mt-2 text-xs text-slate-400">
                                    Estimated:{" "}
                                    {
                                      task.estimatedHours
                                    }{" "}
                                    hours
                                  </p>
                                )}

                                {task.dependencies?.length >
                                  0 && (
                                  <div className="mt-3">

                                    <p className="text-xs font-medium text-slate-500">
                                      Dependencies
                                    </p>

                                    <div className="mt-1 flex flex-wrap gap-2">

                                      {task.dependencies.map(
                                        (
                                          dependency,
                                          dependencyIndex
                                        ) => (
                                          <span
                                            key={
                                              dependencyIndex
                                            }
                                            className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500"
                                          >
                                            {
                                              dependency
                                            }
                                          </span>
                                        )
                                      )}

                                    </div>
                                  </div>
                                )}

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>
              )
            )}

          </div>

          {/* -----------------------------------------------
              CREATE SELECTED TASKS
          ----------------------------------------------- */}

          <button
            type="button"
            onClick={
              createSelectedPlan
            }
            disabled={
              creating ||
              selectedTaskCount ===
                0
            }
            className="w-full rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating
              ? "Creating Tasks in Genome..."
              : `🚀 Create Selected Tasks in Genome${
                  selectedTaskCount > 0
                    ? ` (${selectedTaskCount})`
                    : ""
                }`}
          </button>

        </div>
      )}

    </div>
  );
};

export default AITaskGenerator;