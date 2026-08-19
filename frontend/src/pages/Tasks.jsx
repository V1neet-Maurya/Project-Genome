import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import { useDispatch, useSelector } from "react-redux";

import { toast } from "sonner";

import {
  DndContext,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";

import DroppableColumn from "../components/task/DroppableColumn";
import TaskCard from "../components/task/TaskCard";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskApi";

import { getProjects } from "../services/projectApi";

import {
  setTasks,
  addTask,
  updateTaskInStore,
  removeTask,
  setLoading,
  setError,
} from "../redux/taskSlice";

import EditTaskModal from "../components/task/EditTaskModal";


// =====================================================
// CUSTOM SELECT
// =====================================================

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  className = "",
}) => {
  const [open, setOpen] = useState(false);

  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  // ---------------------------------------------------
  // POSITION DROPDOWN
  // ---------------------------------------------------

  const updatePosition = () => {
    if (!buttonRef.current) {
      return;
    }

    const rect =
      buttonRef.current.getBoundingClientRect();

    const menuHeight = Math.min(
      options.length * 42 + 12,
      260
    );

    let top = rect.bottom + 6;

    // If dropdown would go below viewport,
    // open it above the button.
    if (
      top + menuHeight >
      window.innerHeight - 10
    ) {
      top =
        rect.top -
        menuHeight -
        6;
    }

    setMenuStyle({
      top,
      left: rect.left,
      width: rect.width,
    });
  };

  // ---------------------------------------------------
  // OPEN / CLOSE
  // ---------------------------------------------------

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();

    window.addEventListener(
      "resize",
      updatePosition
    );

    window.addEventListener(
      "scroll",
      updatePosition,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePosition
      );

      window.removeEventListener(
        "scroll",
        updatePosition,
        true
      );
    };
  }, [open, options.length]);

  // ---------------------------------------------------
  // OUTSIDE CLICK
  // ---------------------------------------------------

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        const menuElement =
          document.getElementById(
            "genome-custom-select-menu"
          );

        if (
          menuElement &&
          menuElement.contains(event.target)
        ) {
          return;
        }

        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  // ---------------------------------------------------
  // SELECT OPTION
  // ---------------------------------------------------

  const handleSelect = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full ${className}`}
    >
      {/* BUTTON */}

      <button
        ref={buttonRef}
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        className={`
          flex h-11 w-full items-center
          justify-between gap-3
          rounded-xl
          border
          border-white/[0.08]
          bg-[#080c15]
          px-4
          text-left
          text-sm
          outline-none
          transition-all
          duration-200
          hover:border-purple-500/40
          hover:bg-[#0b111d]
          focus:border-purple-500/70
          focus:ring-2
          focus:ring-purple-500/10
        `}
      >
        <span
          className={
            selectedOption
              ? "truncate text-slate-200"
              : "truncate text-slate-500"
          }
        >
          {selectedOption?.label ||
            placeholder}
        </span>

        <svg
          className={`
            h-4 w-4 shrink-0
            text-slate-500
            transition-transform
            duration-200
            ${open ? "rotate-180 text-purple-400" : ""}
          `}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* DROPDOWN */}

      {open &&
        createPortal(
          <div
            id="genome-custom-select-menu"
            className="
              fixed
              z-[9999]
              overflow-hidden
              rounded-xl
              border
              border-white/[0.10]
              bg-[#0d1422]
              p-1.5
              shadow-2xl
              shadow-black/50
              backdrop-blur-xl
            "
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
              maxHeight: "260px",
              overflowY: "auto",
            }}
          >
            {options.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-500">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected =
                  option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleSelect(option)
                    }
                    className={`
                      flex w-full
                      items-center
                      justify-between
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      transition
                      ${
                        isSelected
                          ? "bg-purple-500/10 text-purple-300"
                          : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                      }
                    `}
                  >
                    <span className="truncate">
                      {option.label}
                    </span>

                    {isSelected && (
                      <svg
                        className="h-4 w-4 shrink-0 text-purple-400"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M5 10.5L8.5 14L15 6.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
};


// =====================================================
// TASKS PAGE
// =====================================================

const Tasks = () => {
  const dispatch = useDispatch();

  const [activeTask, setActiveTask] =
    useState(null);

  const {
    tasks = [],
    loading = false,
    error = null,
  } = useSelector(
    (state) => state.task
  );

  const [projects, setProjects] =
    useState([]);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [projectFilter, setProjectFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      project: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    });

  // =====================================================
  // PROJECT OPTIONS
  // =====================================================

  const projectOptions = useMemo(() => {
    return [
      {
        value: "all",
        label: "All Projects",
      },

      ...projects.map((project) => ({
        value: project._id,
        label: project.name,
      })),
    ];
  }, [projects]);

  // =====================================================
  // CREATE TASK PROJECT OPTIONS
  // =====================================================

  const createProjectOptions = useMemo(() => {
    return projects.map((project) => ({
      value: project._id,
      label: project.name,
    }));
  }, [projects]);

  // =====================================================
  // PRIORITY FILTER OPTIONS
  // =====================================================

  const priorityOptions = [
    {
      value: "all",
      label: "All Priorities",
    },
    {
      value: "critical",
      label: "Critical",
    },
    {
      value: "high",
      label: "High",
    },
    {
      value: "medium",
      label: "Medium",
    },
    {
      value: "low",
      label: "Low",
    },
  ];

  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  const statusOptions = [
    {
      value: "todo",
      label: "Todo",
    },
    {
      value: "in-progress",
      label: "In Progress",
    },
    {
      value: "in-review",
      label: "In Review",
    },
    {
      value: "completed",
      label: "Completed",
    },
  ];

  // =====================================================
  // PRIORITY OPTIONS
  // =====================================================

  const taskPriorityOptions = [
    {
      value: "low",
      label: "Low",
    },
    {
      value: "medium",
      label: "Medium",
    },
    {
      value: "high",
      label: "High",
    },
    {
      value: "critical",
      label: "Critical",
    },
  ];

  // =====================================================
  // FETCH TASKS
  // =====================================================

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const response =
          await getTasks();

        const taskList =
          Array.isArray(
            response?.tasks
          )
            ? response.tasks
            : Array.isArray(
                response?.data?.tasks
              )
            ? response.data.tasks
            : Array.isArray(
                response?.data
              )
            ? response.data
            : Array.isArray(response)
            ? response
            : [];

        dispatch(setTasks(taskList));
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Failed to fetch tasks";

        dispatch(setError(message));

        toast.error(message);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchTasks();
  }, [dispatch]);

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response =
          await getProjects();

        console.log(
          "PROJECT API RESPONSE:",
          response
        );

        const projectList =
          Array.isArray(
            response?.projects
          )
            ? response.projects
            : Array.isArray(
                response?.data?.projects
              )
            ? response.data.projects
            : Array.isArray(
                response?.data
              )
            ? response.data
            : Array.isArray(response)
            ? response
            : [];

        setProjects(
          Array.isArray(projectList)
            ? projectList
            : []
        );
      } catch (error) {
        console.error(
          "Failed to fetch projects:",
          error
        );

        toast.error(
          "Failed to load projects"
        );
      }
    };

    fetchProjects();
  }, []);

  // =====================================================
  // FORM HANDLER
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE TASK
  // =====================================================

  const handleCreateTask = async (
    e
  ) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(
        "Task title is required"
      );
      return;
    }

    if (!formData.project) {
      toast.error(
        "Please select a project"
      );
      return;
    }

    try {
      const response =
        await createTask({
          title:
            formData.title.trim(),

          description:
            formData.description.trim(),

          project:
            formData.project,

          status:
            formData.status,

          priority:
            formData.priority,

          dueDate:
            formData.dueDate || null,
        });

      const createdTask =
        response?.data?.task ||
        response?.task ||
        response?.data ||
        response;

      if (!createdTask?._id) {
        throw new Error(
          "Task creation response is invalid"
        );
      }

      dispatch(
        addTask(createdTask)
      );

      toast.success(
        "Task created successfully"
      );

      setFormData({
        title: "",
        description: "",
        project: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
      });

      setShowCreateModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create task"
      );
    }
  };

  // =====================================================
  // STATUS CHANGE
  // =====================================================

  const handleStatusChange = async (
    taskId,
    status
  ) => {
    try {
      const response =
        await updateTask(
          taskId,
          {
            status,
          }
        );

      const updatedTask =
        response?.data?.task ||
        response?.task ||
        response?.data ||
        response;

      if (!updatedTask?._id) {
        throw new Error(
          "Task update response is invalid"
        );
      }

      dispatch(
        updateTaskInStore(
          updatedTask
        )
      );

      toast.success(
        "Task status updated"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  // =====================================================
  // EDIT TASK
  // =====================================================

  const handleEditTask = (
    task
  ) => {
    setEditingTask(task);
  };

  const handleUpdateTask = async (
    taskId,
    taskData
  ) => {
    try {
      const response =
        await updateTask(
          taskId,
          taskData
        );

      const updatedTask =
        response?.data?.task ||
        response?.task ||
        response?.data ||
        response;

      if (!updatedTask?._id) {
        throw new Error(
          "Task update response is invalid"
        );
      }

      dispatch(
        updateTaskInStore(
          updatedTask
        )
      );

      toast.success(
        "Task updated successfully"
      );

      setEditingTask(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  // =====================================================
  // DELETE TASK
  // =====================================================

  const handleDeleteTask = async (
    taskId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(taskId);

      dispatch(
        removeTask(taskId)
      );

      toast.success(
        "Task deleted successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    }
  };

  // =====================================================
  // DRAG AND DROP
  // =====================================================

  const handleDragStart = (
    event
  ) => {
    const task =
      tasks.find(
        (task) =>
          task._id ===
          event.active.id
      );

    setActiveTask(
      task || null
    );
  };

  const handleDragEnd = async (
    event
  ) => {
    const {
      active,
      over,
    } = event;

    setActiveTask(null);

    if (!over) {
      return;
    }

    const taskId =
      active.id;

    const newStatus =
      over.id;

    const task =
      tasks.find(
        (task) =>
          task._id ===
          taskId
      );

    if (!task) {
      return;
    }

    if (
      task.status ===
      newStatus
    ) {
      return;
    }

    try {
      const response =
        await updateTask(
          taskId,
          {
            status:
              newStatus,
          }
        );

      const updatedTask =
        response?.data?.task ||
        response?.task ||
        response?.data ||
        response;

      dispatch(
        updateTaskInStore(
          updatedTask
        )
      );

      toast.success(
        "Task moved successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to move task"
      );
    }
  };

  // =====================================================
  // FILTER TASKS
  // =====================================================

  const filteredTasks =
    useMemo(() => {
      return tasks.filter(
        (task) => {
          const searchValue =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            !searchValue ||
            task.title
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||
            task.description
              ?.toLowerCase()
              .includes(
                searchValue
              );

          const projectId =
            typeof task.project ===
            "object"
              ? task.project?._id
              : task.project;

          const matchesProject =
            projectFilter ===
              "all" ||
            projectId ===
              projectFilter;

          const matchesPriority =
            priorityFilter ===
              "all" ||
            task.priority ===
              priorityFilter;

          return (
            matchesSearch &&
            matchesProject &&
            matchesPriority
          );
        }
      );
    }, [
      tasks,
      search,
      projectFilter,
      priorityFilter,
    ]);

  // =====================================================
  // KANBAN COLUMNS
  // =====================================================

  const todoTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "todo"
    );

  const inProgressTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "in-progress"
    );

  const inReviewTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "in-review"
    );

  const completedTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "completed"
    );

  // =====================================================
  // STATS
  // =====================================================

  const totalTasks =
    tasks.length;

  const completedCount =
    tasks.filter(
      (task) =>
        task.status ===
        "completed"
    ).length;

  const inProgressCount =
    tasks.filter(
      (task) =>
        task.status ===
        "in-progress"
    ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      <div className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8 flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/15 text-lg text-purple-400">
                ✓
              </div>

              <span className="text-sm font-medium text-purple-400">
                Workspace
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tasks
            </h1>

            <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
              Plan, assign and track work across
              your projects.
            </p>

          </div>

          {/* NEW TASK BUTTON */}

          <button
            type="button"
            onClick={() =>
              setShowCreateModal(
                true
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:bg-purple-500 hover:shadow-purple-900/30 active:scale-[0.98] sm:w-fit"
          >
            <span className="text-lg leading-none">
              +
            </span>

            New Task
          </button>

        </div>

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">
            <p className="text-sm text-slate-400">
              Total Tasks
            </p>

            <p className="mt-2 text-2xl font-bold">
              {totalTasks}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">
            <p className="text-sm text-slate-400">
              In Progress
            </p>

            <p className="mt-2 text-2xl font-bold text-purple-400">
              {inProgressCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">
            <p className="text-sm text-slate-400">
              Completed
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {completedCount}
            </p>
          </div>

        </div>

        {/* ================================================= */}
        {/* FILTER BAR */}
        {/* ================================================= */}

        <div className="relative z-30 mb-6 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-3">

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">

            {/* SEARCH */}

            <div className="relative">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search tasks..."
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#080c15] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500/60"
              />

            </div>

            {/* PROJECT FILTER */}

            <CustomSelect
              value={
                projectFilter
              }
              onChange={
                setProjectFilter
              }
              options={
                projectOptions
              }
              placeholder="All Projects"
            />

            {/* PRIORITY FILTER */}

            <CustomSelect
              value={
                priorityFilter
              }
              onChange={
                setPriorityFilter
              }
              options={
                priorityOptions
              }
              placeholder="All Priorities"
            />

          </div>

        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">

            <div className="flex items-center gap-3 text-slate-400">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-purple-500" />

              Loading tasks...

            </div>

          </div>
        ) : (
          /* ================================================= */
          /* KANBAN */
          /* ================================================= */

          <DndContext
            collisionDetection={
              closestCenter
            }
            onDragStart={
              handleDragStart
            }
            onDragEnd={
              handleDragEnd
            }
          >

            <div className="overflow-x-auto pb-3">

              <div className="grid min-w-[1000px] grid-cols-4 gap-5 xl:min-w-0">

                <DroppableColumn
                  id="todo"
                  title="Todo"
                  tasks={
                    todoTasks
                  }
                  onStatusChange={
                    handleStatusChange
                  }
                  onEdit={
                    handleEditTask
                  }
                  onDelete={
                    handleDeleteTask
                  }
                />

                <DroppableColumn
                  id="in-progress"
                  title="In Progress"
                  tasks={
                    inProgressTasks
                  }
                  onStatusChange={
                    handleStatusChange
                  }
                  onEdit={
                    handleEditTask
                  }
                  onDelete={
                    handleDeleteTask
                  }
                />

                <DroppableColumn
                  id="in-review"
                  title="In Review"
                  tasks={
                    inReviewTasks
                  }
                  onStatusChange={
                    handleStatusChange
                  }
                  onEdit={
                    handleEditTask
                  }
                  onDelete={
                    handleDeleteTask
                  }
                />

                <DroppableColumn
                  id="completed"
                  title="Completed"
                  tasks={
                    completedTasks
                  }
                  onStatusChange={
                    handleStatusChange
                  }
                  onEdit={
                    handleEditTask
                  }
                  onDelete={
                    handleDeleteTask
                  }
                />

              </div>

            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="w-[300px] rotate-2">
                  <TaskCard
                    task={
                      activeTask
                    }
                    onStatusChange={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>

          </DndContext>
        )}

      </div>

      {/* =================================================== */}
      {/* CREATE TASK MODAL */}
      {/* =================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d111c] shadow-2xl">

            {/* Header */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0d111c] px-6 py-5">

              <div>
                <h2 className="text-xl font-semibold">
                  Create New Task
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Add a task to your project
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(
                    false
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={
                handleCreateTask
              }
              className="space-y-5 px-6 py-6"
            >

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Build Login Page"
                  className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Describe what needs to be done..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* PROJECT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Project
                </label>

                <CustomSelect
                  value={
                    formData.project
                  }
                  onChange={(value) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        project:
                          value,
                      })
                    )
                  }
                  options={
                    createProjectOptions
                  }
                  placeholder="Select project"
                />

                {projects.length ===
                  0 && (
                  <p className="mt-2 text-xs text-amber-400">
                    No projects available.
                    Create a project first.
                  </p>
                )}
              </div>

              {/* STATUS + PRIORITY */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Status
                  </label>

                  <CustomSelect
                    value={
                      formData.status
                    }
                    onChange={(value) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          status:
                            value,
                        })
                      )
                    }
                    options={
                      statusOptions
                    }
                    placeholder="Select status"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Priority
                  </label>

                  <CustomSelect
                    value={
                      formData.priority
                    }
                    onChange={(value) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          priority:
                            value,
                        })
                      )
                    }
                    options={
                      taskPriorityOptions
                    }
                    placeholder="Select priority"
                  />
                </div>

              </div>

              {/* DUE DATE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Due Date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={
                    formData.dueDate
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              {/* FOOTER */}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(
                      false
                    )
                  }
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    projects.length ===
                    0
                  }
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create Task
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================== */}
      {/* EDIT TASK MODAL */}
      {/* =================================================== */}

      {editingTask && (
        <EditTaskModal
          task={
            editingTask
          }
          onClose={() =>
            setEditingTask(
              null
            )
          }
          onUpdate={
            handleUpdateTask
          }
        />
      )}

    </div>
  );
};

export default Tasks;