import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

import {
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue,
} from "../services/issueApi";

import { getProjects } from "../services/projectApi";

import {
  setIssues,
  addIssue,
  updateIssueInStore,
  removeIssue,
  setLoading,
  setError,
} from "../redux/issueSlice";


const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const selected = options.find(
    (option) => option.value === value
  );

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = Math.min(options.length * 42 + 12, 260);

    let top = rect.bottom + 6;

    if (top + menuHeight > window.innerHeight - 10) {
      top = rect.top - menuHeight - 6;
    }

    setMenuStyle({
      top,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    const outside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        const menu = document.getElementById(
          "genome-issues-select-menu"
        );

        if (!menu || !menu.contains(event.target)) {
          setOpen(false);
        }
      }
    };

    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full ${className}`}
    >
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#080c15] px-4 text-left text-sm text-slate-300 outline-none transition hover:border-purple-500/40 hover:bg-[#0b111d] focus:border-purple-500/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">
          {selected?.label || placeholder}
        </span>

        <svg
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
            open ? "rotate-180 text-purple-400" : ""
          }`}
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

      {open &&
        createPortal(
          <div
            id="genome-issues-select-menu"
            className="fixed z-[9999] max-h-[260px] overflow-y-auto rounded-xl border border-white/[0.10] bg-[#0d1422] p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-purple-500/10 text-purple-300"
                      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="truncate">
                    {option.label}
                  </span>

                  {isSelected && (
                    <span className="text-purple-400">✓</span>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

const Issues = () => {
  const dispatch = useDispatch();

  const {
    issues = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.issue);

  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [editingIssue, setEditingIssue] =
    useState(null);

  // =====================================================
  // DRAGGED ISSUE
  // =====================================================

  const [activeIssue, setActiveIssue] =
    useState(null);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    status: "open",
    priority: "medium",
    dueDate: "",
  });

  const projectOptions = useMemo(
    () => [
      { value: "all", label: "All Projects" },
      ...projects.map((project) => ({
        value: project._id,
        label:
          project.name ||
          project.projectName ||
          "Unnamed Project",
      })),
    ],
    [projects]
  );

  const createProjectOptions = useMemo(
    () =>
      projects.map((project) => ({
        value: project._id,
        label:
          project.name ||
          project.projectName ||
          "Unnamed Project",
      })),
    [projects]
  );

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const issueStatusOptions = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const issuePriorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  // =====================================================
  // FETCH ISSUES
  // =====================================================

  const fetchIssues = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const response = await getIssues();

      const issueList =
        Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.issues)
          ? response.issues
          : Array.isArray(response?.data?.issues)
          ? response.data.issues
          : Array.isArray(response)
          ? response
          : [];

      dispatch(setIssues(issueList));
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to fetch issues";

      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();

        const projectList =
          Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.projects)
            ? response.projects
            : Array.isArray(response?.data?.projects)
            ? response.data.projects
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

        toast.error("Failed to load projects");
      }
    };

    fetchProjects();
  }, []);

  // =====================================================
  // FILTER ISSUES
  // =====================================================

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchValue ||
        issue.title
          ?.toLowerCase()
          .includes(searchValue) ||
        issue.description
          ?.toLowerCase()
          .includes(searchValue);

      const projectId =
        typeof issue.project === "object"
          ? issue.project?._id
          : issue.project;

      const matchesProject =
        projectFilter === "all" ||
        projectId === projectFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        issue.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        issue.status === statusFilter;

      return (
        matchesSearch &&
        matchesProject &&
        matchesPriority &&
        matchesStatus
      );
    });
  }, [
    issues,
    search,
    projectFilter,
    priorityFilter,
    statusFilter,
  ]);

  // =====================================================
  // COLUMNS
  // =====================================================

  const openIssues = filteredIssues.filter(
    (issue) => issue.status === "open"
  );

  const inProgressIssues = filteredIssues.filter(
    (issue) => issue.status === "in-progress"
  );

  const resolvedIssues = filteredIssues.filter(
    (issue) => issue.status === "resolved"
  );

  const closedIssues = filteredIssues.filter(
    (issue) => issue.status === "closed"
  );

  // =====================================================
  // STATS
  // =====================================================

  const totalIssues = issues.length;

  const openCount = issues.filter(
    (issue) => issue.status === "open"
  ).length;

  const resolvedCount = issues.filter(
    (issue) => issue.status === "resolved"
  ).length;

  // =====================================================
  // FORM CHANGE
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
  // CREATE ISSUE
  // =====================================================

  const handleCreateIssue = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Issue title is required");
      return;
    }

    if (!formData.project) {
      toast.error("Please select a project");
      return;
    }

    try {
      const response = await createIssue({
        title: formData.title.trim(),
        description:
          formData.description.trim(),
        project: formData.project,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
      });

      const createdIssue =
        response?.data?.issue ||
        response?.issue ||
        response?.data ||
        response;

      if (!createdIssue?._id) {
        throw new Error(
          "Issue creation response is invalid"
        );
      }

      dispatch(addIssue(createdIssue));

      toast.success(
        "Issue created successfully"
      );

      setFormData({
        title: "",
        description: "",
        project: "",
        status: "open",
        priority: "medium",
        dueDate: "",
      });

      setShowCreateModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create issue"
      );
    }
  };

  // =====================================================
  // UPDATE ISSUE
  // =====================================================

  const handleUpdateIssue = async (
    issueId,
    data
  ) => {
    try {
      const response = await updateIssue(
        issueId,
        data
      );

      const updatedIssue =
        response?.data?.issue ||
        response?.issue ||
        response?.data ||
        response;

      if (!updatedIssue?._id) {
        throw new Error(
          "Issue update response is invalid"
        );
      }

      dispatch(
        updateIssueInStore(updatedIssue)
      );

      toast.success(
        "Issue updated successfully"
      );

      setEditingIssue(null);

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update issue"
      );

      return false;
    }
  };

  // =====================================================
  // DELETE ISSUE
  // =====================================================

  const handleDeleteIssue = async (
    issueId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteIssue(issueId);

      dispatch(removeIssue(issueId));

      toast.success(
        "Issue deleted successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete issue"
      );
    }
  };

  // =====================================================
  // STATUS CHANGE
  // =====================================================

  const handleStatusChange = async (
    issueId,
    status
  ) => {
    return await handleUpdateIssue(
      issueId,
      {
        status,
      }
    );
  };

  // =====================================================
  // DRAG START
  // =====================================================

  const handleDragStart = (event) => {
    const issue = issues.find(
      (issue) => issue._id === event.active.id
    );

    setActiveIssue(issue || null);
  };

  // =====================================================
  // DRAG END
  // =====================================================

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveIssue(null);

    if (!over) {
      return;
    }

    const issueId = active.id;

    const newStatus = over.id;

    const issue = issues.find(
      (issue) => issue._id === issueId
    );

    if (!issue) {
      return;
    }

    // Same column
    if (issue.status === newStatus) {
      return;
    }

    // Make sure we only accept valid statuses
    const validStatuses = [
      "open",
      "in-progress",
      "resolved",
      "closed",
    ];

    if (!validStatuses.includes(newStatus)) {
      return;
    }

    try {
      const response = await updateIssue(
        issueId,
        {
          status: newStatus,
        }
      );

      const updatedIssue =
        response?.data?.issue ||
        response?.issue ||
        response?.data ||
        response;

      if (!updatedIssue?._id) {
        throw new Error(
          "Issue update response is invalid"
        );
      }

      dispatch(
        updateIssueInStore(updatedIssue)
      );

      toast.success(
        "Issue moved successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to move issue"
      );
    }
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setProjectFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      <div className="mx-auto max-w-[1800px] px-5 py-8 sm:px-8 lg:px-10">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                !
              </div>

              <span className="text-sm font-medium text-red-400">
                Issue Tracker
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Issues
            </h1>

            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Track bugs, problems and issues
              across your projects.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowCreateModal(true)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-purple-900/20 transition hover:bg-purple-500 sm:w-fit"
          >
            <span className="text-lg">
              +
            </span>

            New Issue
          </button>

        </div>

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">
            <p className="text-sm text-slate-400">
              Total Issues
            </p>

            <p className="mt-2 text-2xl font-bold">
              {totalIssues}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">
            <p className="text-sm text-slate-400">
              Open
            </p>

            <p className="mt-2 text-2xl font-bold text-red-400">
              {openCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">
            <p className="text-sm text-slate-400">
              Resolved
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {resolvedCount}
            </p>
          </div>

        </div>

        {/* FILTERS */}

        <div className="mb-5 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-3">

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_200px_auto]">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search issues..."
              className="h-11 flex-1 rounded-xl border border-white/[0.07] bg-[#080c15] px-4 text-sm outline-none placeholder:text-slate-600 focus:border-purple-500"
            />

            {/* PROJECT */}

            <CustomSelect
              value={projectFilter}
              onChange={setProjectFilter}
              options={projectOptions}
              placeholder="All Projects"
            />

            {/* PRIORITY */}

            <CustomSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={priorityOptions}
              placeholder="All Priorities"
            />

            {/* STATUS */}

            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="All Status"
            />

            <button
              type="button"
              onClick={clearFilters}
              className="h-11 rounded-xl border border-white/[0.07] px-4 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Clear
            </button>

          </div>

        </div>

        <p className="mb-4 text-xs text-slate-500">
          Showing{" "}
          {filteredIssues.length} of{" "}
          {issues.length} issues
        </p>

        {/* ERROR */}

        {!loading && error && (
          <div className="mb-5">
            <ErrorState
              message={error}
              onRetry={fetchIssues}
            />
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          !error &&
          issues.length === 0 && (
            <div className="mb-5">
              <EmptyState
                icon="!"
                title="No issues found"
                description="Great! There are no issues to show right now."
              />
            </div>
          )}

        {/* DND KIT KANBAN */}

        {!loading &&
          !error &&
          issues.length > 0 && (
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="overflow-x-auto pb-3"><div className="grid min-w-[1000px] grid-cols-4 gap-5 xl:min-w-0">

                <IssueColumn
                  id="open"
                  title="Open"
                  status="open"
                  issues={openIssues}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingIssue}
                  onDelete={handleDeleteIssue}
                />

                <IssueColumn
                  id="in-progress"
                  title="In Progress"
                  status="in-progress"
                  issues={inProgressIssues}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingIssue}
                  onDelete={handleDeleteIssue}
                />

                <IssueColumn
                  id="resolved"
                  title="Resolved"
                  status="resolved"
                  issues={resolvedIssues}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingIssue}
                  onDelete={handleDeleteIssue}
                />

                <IssueColumn
                  id="closed"
                  title="Closed"
                  status="closed"
                  issues={closedIssues}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingIssue}
                  onDelete={handleDeleteIssue}
                />

              </div></div>

              {/* DRAG OVERLAY */}

              <DragOverlay>
                {activeIssue ? (
                  <div className="w-[300px] rotate-2">
                    <IssueCard
                      issue={activeIssue}
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

      {/* CREATE MODAL */}

      {showCreateModal && (
        <CreateIssueModal
          formData={formData}
          projects={projects}
          onChange={handleChange}
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreateIssue}
        />
      )}

      {/* EDIT MODAL */}

      {editingIssue && (
        <EditIssueModal
          issue={editingIssue}
          projects={projects}
          onClose={() => setEditingIssue(null)}
          onSubmit={handleUpdateIssue}
        />
      )}

    </div>
  );
};

export default Issues;


// =====================================================
// ISSUE COLUMN
// =====================================================

const IssueColumn = ({
  id,
  title,
  status,
  issues,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id,
  });

  const colors = {
    open: "bg-red-400",
    "in-progress": "bg-purple-400",
    resolved: "bg-emerald-400",
    closed: "bg-slate-500",
  };

  return (
    <div
      className={`
        min-h-[420px]
        rounded-2xl
        border
        bg-[#0b111c]
        p-4
        transition-all
        duration-200
        ${
          isOver
            ? "border-purple-500/60 bg-purple-500/[0.06] shadow-xl shadow-purple-900/20"
            : "border-white/[0.07]"
        }
      `}
    >

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <span
            className={`h-2.5 w-2.5 rounded-full ${colors[status]}`}
          />

          <h2 className="text-sm font-semibold">
            {title}
          </h2>

        </div>

        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-slate-400">
          {issues.length}
        </span>

      </div>

      {/* DROP AREA */}

      <div
        ref={setNodeRef}
        className={`
          min-h-[340px]
          space-y-3
          rounded-xl
          p-1
          transition-all
          duration-200
          ${
            isOver
              ? "border border-dashed border-purple-500/50 bg-purple-500/[0.04]"
              : ""
          }
        `}
      >

        {issues.map((issue) => (
          <IssueCard
            key={issue._id}
            issue={issue}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {issues.length === 0 && (
          <div
            className={`
              flex
              min-h-[300px]
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              text-sm
              transition-all
              ${
                isOver
                  ? "border-purple-500/50 text-purple-400"
                  : "border-white/[0.07] text-slate-600"
              }
            `}
          >
            {isOver
              ? "Drop issue here"
              : "No issues"}
          </div>
        )}

      </div>

    </div>
  );
};


// =====================================================
// ISSUE CARD
// =====================================================


// =====================================================
// SHARED ISSUE DROPDOWN OPTIONS
// These are outside Issues() because IssueCard() also
// needs access to them.
// =====================================================

const issueStatusOptions = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const issuePriorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];


const IssueCard = ({
  issue,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: issue._id,
  });

  const priorityStyles = {
    critical:
      "bg-red-500/10 text-red-400 border-red-500/20",
    high:
      "bg-orange-500/10 text-orange-400 border-orange-500/20",
    medium:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const stopDrag = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group
        cursor-grab
        rounded-xl
        border
        border-white/[0.07]
        bg-[#0f1622]
        p-4
        transition
        duration-200
        hover:-translate-y-0.5
        hover:border-purple-500/30
        active:cursor-grabbing
        ${
          isDragging
            ? "scale-[1.02] opacity-30"
            : "opacity-100"
        }
      `}
    >
      {/* CARD HEADER */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-100">
          {issue.title}
        </h3>

        {/* ACTIONS */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onPointerDown={stopDrag}
            onMouseDown={stopDrag}
            onClick={(e) => {
              stopDrag(e);
              onEdit?.(issue);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
            title="Edit issue"
            aria-label="Edit issue"
          >
            ✎
          </button>

          <button
            type="button"
            onPointerDown={stopDrag}
            onMouseDown={stopDrag}
            onClick={(e) => {
              stopDrag(e);
              onDelete?.(issue._id);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            title="Delete issue"
            aria-label="Delete issue"
          >
            🗑
          </button>
        </div>
      </div>

      {/* DESCRIPTION */}
      {issue.description && (
        <p className="mb-4 line-clamp-2 text-xs leading-5 text-slate-500">
          {issue.description}
        </p>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="w-[125px] shrink-0"
          onPointerDown={stopDrag}
          onMouseDown={stopDrag}
          onClick={stopDrag}
        >
          <CustomSelect
            value={issue.status || "open"}
            onChange={(value) =>
              onStatusChange(issue._id, value)
            }
            options={issueStatusOptions}
          />
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
            priorityStyles[issue.priority] || priorityStyles.medium
          }`}
        >
          {issue.priority || "medium"}
        </span>
      </div>
    </div>
  );
};


// =====================================================
// CREATE ISSUE MODAL
// =====================================================

const CreateIssueModal = ({
  formData,
  projects,
  onChange,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d111c] shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

          <div>

            <h2 className="text-xl font-semibold">
              Create New Issue
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Report a bug or project issue
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={onSubmit}
          className="space-y-5 px-6 py-6"
        >

          {/* TITLE */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="e.g. Login button not working"
              className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-purple-500"
            />

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={4}
              placeholder="Describe the issue..."
              className="w-full resize-none rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-purple-500"
            />

          </div>

          {/* PROJECT */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Project
            </label>

            <CustomSelect
              value={formData.project}
              onChange={(value) =>
                onChange({
                  target: {
                    name: "project",
                    value,
                  },
                })
              }
              options={createProjectOptions}
              placeholder="Select project"
            />

          </div>

          {/* STATUS + PRIORITY */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Status
              </label>

              <CustomSelect
                value={formData.status}
                onChange={(value) =>
                  onChange({
                    target: {
                      name: "status",
                      value,
                    },
                  })
                }
                options={issueStatusOptions}
                placeholder="Select status"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Priority
              </label>

              <CustomSelect
                value={formData.priority}
                onChange={(value) =>
                  onChange({
                    target: {
                      name: "priority",
                      value,
                    },
                  })
                }
                options={issuePriorityOptions}
                placeholder="Select priority"
              />

            </div>

          </div>

          {/* DUE DATE */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Due Date
            </label>

            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={onChange}
              className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm outline-none focus:border-purple-500"
            />

          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold hover:bg-purple-500"
            >
              Create Issue
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

// =====================================================
// EDIT ISSUE MODAL
// =====================================================

const EditIssueModal = ({
  issue,
  projects,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    title: issue?.title || "",
    description: issue?.description || "",
    project:
      typeof issue?.project === "object"
        ? issue.project?._id || ""
        : issue?.project || "",
    status: issue?.status || "open",
    priority: issue?.priority || "medium",
    dueDate: issue?.dueDate
      ? String(issue.dueDate).slice(0, 10)
      : "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Issue title is required");
      return;
    }

    if (!form.project) {
      toast.error("Please select a project");
      return;
    }

    setSaving(true);

    const success = await onSubmit(issue._id, {
      title: form.title.trim(),
      description: form.description.trim(),
      project: form.project,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
    });

    setSaving(false);

    if (!success) {
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d111c] shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">
              Edit Issue
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Update the issue details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-6 py-6"
        >
          {/* TITLE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Issue title"
              className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-purple-500"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the issue..."
              className="w-full resize-none rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-purple-500"
            />
          </div>

          {/* PROJECT */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Project
            </label>
            <CustomSelect
              value={form.project}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  project: value,
                }))
              }
              options={projects.map((project) => ({
                value: project._id,
                label:
                  project.name ||
                  project.projectName ||
                  "Unnamed Project",
              }))}
              placeholder="Select project"
            />
          </div>

          {/* STATUS + PRIORITY */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>
              <CustomSelect
                value={form.status}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
                options={issueStatusOptions}
                placeholder="Select status"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Priority
              </label>
              <CustomSelect
                value={form.priority}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: value,
                  }))
                }
                options={issuePriorityOptions}
                placeholder="Select priority"
              />
            </div>
          </div>

          {/* DUE DATE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm outline-none focus:border-purple-500"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};