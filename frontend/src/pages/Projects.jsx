import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import {
  FolderKanban,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  addProject,
  removeProject,
  setProjects,
  setLoading,
  setError,
} from "../redux/projectSlice";

import {
  getProjects,
  createProject,
  deleteProject,
} from "../services/projectApi";

const Projects = () => {
  const dispatch = useDispatch();

  // =====================================================
  // LOCAL PROJECT STATE
  // =====================================================

  const [projectList, setProjectList] =
    useState([]);

  const [loading, setPageLoading] =
    useState(true);

  const [error, setPageError] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning",
    visibility: "private",
    technologies: "",
    deadline: "",
  });

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  const fetchProjects = async () => {
    try {
      setPageLoading(true);
      setPageError(null);

      dispatch(setLoading(true));
      dispatch(setError(null));

      console.log(
        "Fetching projects..."
      );

      const response =
        await getProjects();

      console.log(
        "PROJECT API RESPONSE:",
        response
      );

      let projectsFromApi = [];

      if (
        Array.isArray(
          response?.projects
        )
      ) {
        projectsFromApi =
          response.projects;
      } else if (
        Array.isArray(
          response?.data?.projects
        )
      ) {
        projectsFromApi =
          response.data.projects;
      } else if (
        Array.isArray(response?.data)
      ) {
        projectsFromApi =
          response.data;
      } else if (
        Array.isArray(response)
      ) {
        projectsFromApi =
          response;
      }

      console.log(
        "PROJECTS RECEIVED:",
        projectsFromApi
      );

      console.log(
        "PROJECT COUNT:",
        projectsFromApi.length
      );

      // LOCAL STATE
      setProjectList(
        projectsFromApi
      );

      // REDUX STATE
      dispatch(
        setProjects(
          projectsFromApi
        )
      );
    } catch (err) {
      console.error(
        "PROJECT FETCH ERROR:",
        err
      );

      const message =
        err?.response?.data
          ?.message ||
        err?.message ||
        "Failed to load projects.";

      setPageError(message);

      dispatch(
        setError(message)
      );
    } finally {
      setPageLoading(false);

      dispatch(
        setLoading(false)
      );
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchProjects();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE PROJECT
  // =====================================================

  const handleCreateProject =
    async (e) => {
      e.preventDefault();

      if (
        !formData.name.trim()
      ) {
        setPageError(
          "Project name is required."
        );

        return;
      }

      try {
        setPageError(null);

        const projectData = {
          name:
            formData.name.trim(),

          description:
            formData.description.trim(),

          status:
            formData.status,

          visibility:
            formData.visibility,

          technologies:
            formData.technologies
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),

          ...(formData.deadline
            ? {
                deadline:
                  formData.deadline,
              }
            : {}),
        };

        const response =
          await createProject(
            projectData
          );

        console.log(
          "CREATE RESPONSE:",
          response
        );

        const newProject =
          response?.project ||
          response?.data?.project ||
          response?.data;

        if (
          newProject &&
          newProject._id
        ) {
          setProjectList(
            (previous) => [
              newProject,
              ...previous,
            ]
          );

          dispatch(
            addProject(
              newProject
            )
          );
        }

        setFormData({
          name: "",
          description: "",
          status: "planning",
          visibility: "private",
          technologies: "",
          deadline: "",
        });

        setShowModal(false);

        await fetchProjects();
      } catch (err) {
        console.error(
          "CREATE PROJECT ERROR:",
          err
        );

        setPageError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Failed to create project."
        );
      }
    };

  // =====================================================
  // DELETE PROJECT
  // =====================================================

  const handleDelete =
    async (projectId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this project?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteProject(
          projectId
        );

        setProjectList(
          (previous) =>
            previous.filter(
              (project) =>
                project._id !==
                projectId
            )
        );

        dispatch(
          removeProject(
            projectId
          )
        );
      } catch (err) {
        console.error(
          "DELETE PROJECT ERROR:",
          err
        );

        setPageError(
          err?.response?.data
            ?.message ||
            "Failed to delete project."
        );
      }
    };

  // =====================================================
  // SEARCH
  // =====================================================

  const searchText =
    search
      .toLowerCase()
      .trim();

  const filteredProjects =
    projectList.filter(
      (project) => {
        const name =
          project?.name
            ?.toLowerCase() ||
          "";

        const description =
          project?.description
            ?.toLowerCase() ||
          "";

        return (
          name.includes(
            searchText
          ) ||
          description.includes(
            searchText
          )
        );
      }
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] px-4 py-8 text-white sm:px-6 lg:px-8">

        <div className="mx-auto max-w-[1500px]">

          <h1 className="text-3xl font-bold">
            Projects
          </h1>

          <div className="flex min-h-[400px] items-center justify-center">

            <p className="text-slate-400">
              Loading projects...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#070b14] text-white">

      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">

              <FolderKanban
                size={24}
              />

            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Projects
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Create and manage your
              development workspaces.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowModal(true)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500 sm:w-auto"
          >
            <Plus size={18} />

            New Project
          </button>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-6 flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0d1320] px-4 py-3">

          <Search
            size={18}
            className="shrink-0 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search projects..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 p-4">

            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={
                fetchProjects
              }
              className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20"
            >
              Try Again
            </button>

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error &&
          projectList.length ===
            0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] text-center">

              <div className="mb-4 text-4xl">
                📁
              </div>

              <h2 className="text-lg font-semibold">
                No projects yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Create your first project
                to start organizing your
                work.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowModal(true)
                }
                className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold hover:bg-purple-500"
              >
                + Create Project
              </button>

            </div>
          )}

        {/* =================================================
            SEARCH EMPTY
        ================================================= */}

        {!error &&
          projectList.length >
            0 &&
          filteredProjects.length ===
            0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-12 text-center">

              <div className="mb-4 text-3xl">
                🔍
              </div>

              <h2 className="font-semibold">
                No projects found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try another search term.
              </p>

            </div>
          )}

        {/* =================================================
            PROJECT CARDS
        ================================================= */}

        {!error &&
          filteredProjects.length >
            0 && (
            <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {filteredProjects.map(
                (project) => {

                  const projectId =
                    project?._id;

                  const progress =
                    Math.min(
                      Math.max(
                        Number(
                          project?.progress
                        ) || 0,
                        0
                      ),
                      100
                    );

                  return (
                    <div
                      key={projectId}
                      className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5 transition hover:border-purple-500/30"
                    >

                      {/* PROJECT TITLE */}

                      <div className="mb-4 flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h2 className="truncate text-lg font-semibold">
                            {project?.name ||
                              "Untitled Project"}
                          </h2>

                          <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                            {project?.description ||
                              "No description available."}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              projectId
                            )
                          }
                          className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                          aria-label="Delete project"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>

                      </div>

                      {/* OWNER */}

                      <div className="mb-4 text-xs text-slate-500">

                        Owner:{" "}

                        <span className="text-slate-300">

                          {project?.owner
                            ?.firstName
                            ? `${project.owner.firstName} ${
                                project.owner.lastName ||
                                ""
                              }`
                            : project?.owner
                                ?.email ||
                              "Unknown"}

                        </span>

                      </div>

                      {/* STATUS */}

                      <div className="mb-5">

                        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs capitalize text-purple-300">

                          {project?.status
                            ?.replaceAll(
                              "-",
                              " "
                            )
                            ?.replaceAll(
                              "_",
                              " "
                            ) ||
                            "planning"}

                        </span>

                      </div>

                      {/* PROGRESS */}

                      <div>

                        <div className="mb-2 flex justify-between text-xs">

                          <span className="text-slate-500">
                            Progress
                          </span>

                          <span className="text-slate-300">
                            {progress}%
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                          <div
                            className="h-full rounded-full bg-purple-500 transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* TECHNOLOGIES */}

                      {Array.isArray(
                        project?.technologies
                      ) &&
                        project.technologies
                          .length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">

                            {project.technologies.map(
                              (
                                technology,
                                index
                              ) => (
                                <span
                                  key={`${technology}-${index}`}
                                  className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-slate-400"
                                >
                                  {technology}
                                </span>
                              )
                            )}

                          </div>
                        )}

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>

      {/* =================================================
          CREATE PROJECT MODAL
      ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0d1320] p-5 shadow-2xl sm:p-6">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Create New Project
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Create a new development
                workspace.
              </p>

            </div>

            <form
              onSubmit={
                handleCreateProject
              }
              className="space-y-4"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Project name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleChange
                  }
                  placeholder="Enter project name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
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
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                />

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Status
                </label>

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="planning">
                    Planning
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="on-hold">
                    On Hold
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>

              </div>

              {/* VISIBILITY */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Visibility
                </label>

                <select
                  name="visibility"
                  value={
                    formData.visibility
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="private">
                    Private
                  </option>

                  <option value="public">
                    Public
                  </option>
                </select>

              </div>

              {/* TECHNOLOGIES */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Technologies
                </label>

                <input
                  type="text"
                  name="technologies"
                  value={
                    formData.technologies
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="React, Node.js, MongoDB"
                  className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                />

              </div>

              {/* DEADLINE */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Deadline
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={
                    formData.deadline
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 sm:w-auto"
                >
                  Create Project
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Projects;