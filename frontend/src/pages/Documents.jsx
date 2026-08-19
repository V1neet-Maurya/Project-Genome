import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import ErrorState from "../components/ErrorState";

import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from "../services/documentApi";

import { getProjects } from "../services/projectApi";

import {
  setDocuments,
  addDocument,
  removeDocument,
  setLoading,
  setError,
} from "../redux/documentSlice";

const Documents = () => {
  const dispatch = useDispatch();

  const {
    documents = [],
    loading,
    error,
  } = useSelector((state) => state.document);

  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");

  const [projectFilter, setProjectFilter] =
    useState("all");

  const [projectDropdownOpen, setProjectDropdownOpen] =
    useState(false);

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [selectedProject, setSelectedProject] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  // =====================================================
  // FETCH DOCUMENTS
  // =====================================================

  const fetchDocuments = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await getDocuments();

      dispatch(
        setDocuments(response.data || [])
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to load documents";

      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  useEffect(() => {
    fetchDocuments();
  }, [dispatch]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();

        const projectData =
          response?.data ||
          response?.projects ||
          [];

        setProjects(
          Array.isArray(projectData)
            ? projectData
            : []
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load projects"
        );
      }
    };

    fetchProjects();
  }, []);

  // =====================================================
  // FILTER DOCUMENTS
  // =====================================================

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const searchText =
        search.trim().toLowerCase();

      const documentName =
        document.name ||
        document.fileName ||
        "";

      const matchesSearch =
        !searchText ||
        documentName
          .toLowerCase()
          .includes(searchText);

      const documentProjectId =
        typeof document.project === "object"
          ? document.project?._id
          : document.project;

      const matchesProject =
        projectFilter === "all" ||
        documentProjectId === projectFilter;

      return (
        matchesSearch &&
        matchesProject
      );
    });
  }, [
    documents,
    search,
    projectFilter,
  ]);

  // =====================================================
  // SELECTED PROJECT NAME
  // =====================================================

  const selectedProjectName = useMemo(() => {
    if (projectFilter === "all") {
      return "All Projects";
    }

    const project = projects.find(
      (item) =>
        item._id === projectFilter
    );

    return (
      project?.name ||
      project?.projectName ||
      "All Projects"
    );
  }, [
    projects,
    projectFilter,
  ]);

  // =====================================================
  // FILE SELECT
  // =====================================================

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      toast.error(
        "File size must be less than 10 MB"
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error(
        "Please select a file"
      );
      return;
    }

    if (!selectedProject) {
      toast.error(
        "Please select a project"
      );
      return;
    }

    try {
      setUploading(true);

      const response =
        await uploadDocument(
          selectedFile,
          selectedProject
        );

      dispatch(
        addDocument(response.data)
      );

      toast.success(
        "Document uploaded successfully"
      );

      setSelectedFile(null);
      setSelectedProject("");
      setShowUploadModal(false);

      await fetchDocuments();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to upload document"
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // DELETE DOCUMENT
  // =====================================================

  const handleDelete = async (
    documentId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this document?"
      );

    if (!confirmed) return;

    try {
      await deleteDocument(documentId);

      dispatch(
        removeDocument(documentId)
      );

      toast.success(
        "Document deleted successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete document"
      );
    }
  };

  // =====================================================
  // FILE SIZE
  // =====================================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    const units = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );

    const safeIndex = Math.min(
      index,
      units.length - 1
    );

    return `${(
      bytes /
      Math.pow(1024, safeIndex)
    ).toFixed(
      safeIndex === 0 ? 0 : 1
    )} ${units[safeIndex]}`;
  };

  // =====================================================
  // FILE ICON
  // =====================================================

  const getFileIcon = (type) => {
    if (!type) {
      return "📄";
    }

    if (type.includes("pdf")) {
      return "📕";
    }

    if (type.includes("image")) {
      return "🖼️";
    }

    if (
      type.includes("zip") ||
      type.includes("rar")
    ) {
      return "📦";
    }

    if (
      type.includes("word") ||
      type.includes("document")
    ) {
      return "📘";
    }

    if (
      type.includes("spreadsheet") ||
      type.includes("excel")
    ) {
      return "📗";
    }

    return "📄";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#070b14] text-white">

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div className="min-w-0">

            <div className="mb-3 flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                📄
              </div>

              <span className="text-sm font-medium text-blue-400">
                Project Files
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Documents
            </h1>

            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Store and manage your project files.
            </p>

          </div>

          {/* UPLOAD BUTTON */}

          <button
            type="button"
            onClick={() =>
              setShowUploadModal(true)
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-purple-600
              px-5
              py-3
              text-sm
              font-semibold
              transition
              hover:bg-purple-500
              sm:w-fit
            "
          >
            <span className="text-lg">
              +
            </span>

            Upload File
          </button>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="relative z-30 mb-5 w-full rounded-2xl border border-white/[0.07] bg-[#0d1320] p-3">

          <div className="flex w-full flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search files..."
              className="
                h-11
                w-full
                min-w-0
                rounded-xl
                border
                border-white/[0.07]
                bg-[#080c15]
                px-4
                text-sm
                outline-none
                placeholder:text-slate-600
                focus:border-purple-500
                lg:flex-1
              "
            />

            {/* =================================================
                CUSTOM PROJECT DROPDOWN
            ================================================= */}

            <div className="relative w-full lg:w-auto lg:min-w-[180px]">

              <button
                type="button"
                onClick={() =>
                  setProjectDropdownOpen(
                    (previous) =>
                      !previous
                  )
                }
                className="
                  flex
                  h-11
                  w-full
                  min-w-0
                  items-center
                  justify-between
                  gap-3
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-[#080c15]
                  px-4
                  text-left
                  text-sm
                  text-slate-300
                  outline-none
                  transition
                  hover:border-white/10
                  focus:border-purple-500
                "
              >

                <span className="min-w-0 flex-1 truncate">
                  {selectedProjectName}
                </span>

                <span
                  className={`shrink-0 text-[10px] text-slate-500 transition-transform ${
                    projectDropdownOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  ▼
                </span>

              </button>

              {/* DROPDOWN */}

              {projectDropdownOpen && (
                <>

                  {/* CLOSE OVERLAY */}

                  <button
                    type="button"
                    aria-label="Close project dropdown"
                    onClick={() =>
                      setProjectDropdownOpen(
                        false
                      )
                    }
                    className="fixed inset-0 z-40 h-full w-full cursor-default"
                  />

                  {/* DROPDOWN MENU */}

                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      top-12
                      z-50
                      max-h-60
                      w-full
                      overflow-y-auto
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-[#0d1320]
                      p-1
                      shadow-2xl
                    "
                  >

                    {/* ALL PROJECTS */}

                    <button
                      type="button"
                      onClick={() => {
                        setProjectFilter(
                          "all"
                        );

                        setProjectDropdownOpen(
                          false
                        );
                      }}
                      className={`
                        w-full
                        rounded-lg
                        px-3
                        py-2.5
                        text-left
                        text-sm
                        transition
                        ${
                          projectFilter ===
                          "all"
                            ? "bg-purple-500/10 text-purple-400"
                            : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                        }
                      `}
                    >
                      All Projects
                    </button>

                    {/* PROJECT LIST */}

                    {projects.map(
                      (project) => {
                        const projectName =
                          project.name ||
                          project.projectName ||
                          "Unnamed Project";

                        return (
                          <button
                            key={
                              project._id
                            }
                            type="button"
                            onClick={() => {
                              setProjectFilter(
                                project._id
                              );

                              setProjectDropdownOpen(
                                false
                              );
                            }}
                            className={`
                              w-full
                              rounded-lg
                              px-3
                              py-2.5
                              text-left
                              text-sm
                              transition
                              ${
                                projectFilter ===
                                project._id
                                  ? "bg-purple-500/10 text-purple-400"
                                  : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                              }
                            `}
                          >
                            <span className="block truncate">
                              {projectName}
                            </span>
                          </button>
                        );
                      }
                    )}

                  </div>

                </>
              )}

            </div>

            {/* CLEAR */}

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setProjectFilter("all");
              }}
              className="
                h-11
                w-full
                rounded-xl
                border
                border-white/[0.07]
                px-4
                text-sm
                text-slate-400
                transition
                hover:bg-white/[0.04]
                hover:text-white
                lg:w-auto
              "
            >
              Clear
            </button>

          </div>

        </div>

        {/* =================================================
            FILE COUNT
        ================================================= */}

        <p className="mb-4 text-xs text-slate-500">
          Showing{" "}
          {filteredDocuments.length}{" "}
          of {documents.length} files
        </p>

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <ErrorState
            message={error}
            onRetry={fetchDocuments}
          />
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center text-slate-400">
            Loading documents...
          </div>
        ) : error ? (
          null
        ) : (
          <div className="w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1320]">

            {/* DESKTOP HEADER */}

            <div className="hidden grid-cols-[1fr_180px_130px_100px_90px] gap-4 border-b border-white/[0.07] px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid">

              <span>File</span>
              <span>Project</span>
              <span>Size</span>
              <span>Uploaded</span>
              <span>Action</span>

            </div>

            {/* DOCUMENTS */}

            {filteredDocuments.map(
              (document) => (
                <div
                  key={document._id}
                  className="
                    grid
                    min-w-0
                    gap-4
                    border-b
                    border-white/[0.06]
                    px-4
                    py-5
                    transition
                    last:border-b-0
                    hover:bg-white/[0.02]
                    sm:px-5
                    md:grid-cols-[1fr_180px_130px_100px_90px]
                    md:items-center
                    md:px-6
                  "
                >

                  {/* FILE */}

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-xl">
                      {getFileIcon(
                        document.fileType
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-medium text-slate-200">
                        {document.name ||
                          document.fileName ||
                          "Unnamed File"}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {document.fileType ||
                          "File"}
                      </p>

                    </div>

                  </div>

                  {/* PROJECT */}

                  <div className="min-w-0 text-sm text-slate-400">

                    <span className="mr-2 text-xs text-slate-600 md:hidden">
                      Project:
                    </span>

                    <span className="block truncate">
                      {document.project?.name ||
                        "Unknown Project"}
                    </span>

                  </div>

                  {/* SIZE */}

                  <div className="text-sm text-slate-400">

                    <span className="mr-2 text-xs text-slate-600 md:hidden">
                      Size:
                    </span>

                    {formatFileSize(
                      document.fileSize
                    )}

                  </div>

                  {/* DATE */}

                  <div className="text-sm text-slate-500">

                    <span className="mr-2 text-xs text-slate-600 md:hidden">
                      Uploaded:
                    </span>

                    {document.createdAt
                      ? new Date(
                          document.createdAt
                        ).toLocaleDateString()
                      : "—"}

                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap items-center gap-2">

                    {document.fileUrl && (
                      <a
                        href={
                          document.fileUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="
                          rounded-lg
                          border
                          border-white/10
                          px-3
                          py-2
                          text-xs
                          text-slate-300
                          transition
                          hover:bg-white/[0.05]
                          hover:text-white
                        "
                      >
                        Open
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          document._id
                        )
                      }
                      className="
                        rounded-lg
                        border
                        border-red-500/10
                        px-3
                        py-2
                        text-xs
                        text-red-400
                        transition
                        hover:bg-red-500/10
                      "
                    >
                      Delete
                    </button>

                  </div>

                </div>
              )
            )}

            {/* EMPTY */}

            {filteredDocuments.length ===
              0 && (
              <div className="p-10 text-center sm:p-16">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl">
                  📁
                </div>

                <h2 className="font-semibold">
                  No documents found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Upload your first project document.
                </p>

              </div>
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          UPLOAD MODAL
      ===================================================== */}

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm">

          <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d111c] shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">

              <div className="min-w-0">

                <h2 className="text-xl font-semibold">
                  Upload Document
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Maximum file size: 10 MB
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowUploadModal(false)
                }
                className="shrink-0 rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleUpload}
              className="space-y-5 p-5 sm:p-6"
            >

              {/* FILE */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  File
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#080c15] px-4 py-8 text-center transition hover:border-purple-500/40 sm:px-5 sm:py-10">

                  <span className="mb-3 text-3xl">
                    📁
                  </span>

                  <span className="max-w-full truncate px-2 text-sm text-slate-300">
                    {selectedFile
                      ? selectedFile.name
                      : "Choose a file"}
                  </span>

                  <span className="mt-1 text-xs text-slate-600">
                    Click to browse
                  </span>

                  <input
                    type="file"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />

                </label>

              </div>

              {/* PROJECT */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Project
                </label>

                <select
                  value={selectedProject}
                  onChange={(event) =>
                    setSelectedProject(
                      event.target.value
                    )
                  }
                  className="
                    h-11
                    w-full
                    min-w-0
                    rounded-xl
                    border
                    border-white/10
                    bg-[#080c15]
                    px-4
                    text-sm
                    text-slate-300
                    outline-none
                    focus:border-purple-500
                  "
                >

                  <option value="">
                    Select project
                  </option>

                  {projects.map(
                    (project) => (
                      <option
                        key={
                          project._id
                        }
                        value={
                          project._id
                        }
                      >
                        {project.name ||
                          project.projectName ||
                          "Unnamed Project"}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setShowUploadModal(false)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    px-5
                    py-2.5
                    text-sm
                    text-slate-300
                    hover:bg-white/5
                    sm:w-auto
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="
                    w-full
                    rounded-xl
                    bg-purple-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    transition
                    hover:bg-purple-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:w-auto
                  "
                >
                  {uploading
                    ? "Uploading..."
                    : "Upload"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Documents;