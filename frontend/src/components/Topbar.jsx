import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  clearUser,
} from "../redux/userSlice";

import {
  globalSearch,
} from "../services/searchApi";

import NotificationBell from "./NotificationBell";

const Topbar = ({
  setMobileOpen,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.user
  );

  // =====================================================
  // SEARCH STATE
  // =====================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState(null);

  const [searchLoading, setSearchLoading] =
    useState(false);

  // =====================================================
  // GLOBAL SEARCH
  // =====================================================

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(
      async () => {
        try {
          setSearchLoading(true);

          const response =
            await globalSearch(query);

          setSearchResults(
            response?.data || {
              projects: [],
              tasks: [],
              issues: [],
              documents: [],
            }
          );
        } catch (error) {
          console.error(
            "Search error:",
            error
          );

          setSearchResults({
            projects: [],
            tasks: [],
            issues: [],
            documents: [],
          });
        } finally {
          setSearchLoading(false);
        }
      },
      400
    );

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // =====================================================
  // SEARCH NAVIGATION
  // =====================================================

  const handleSearchNavigation = (
    path
  ) => {
    setSearchQuery("");
    setSearchResults(null);
    navigate(path);
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = () => {
    const first =
      user?.firstName?.charAt(0) || "";

    const last =
      user?.lastName?.charAt(0) || "";

    return (
      first + last || "U"
    ).toUpperCase();
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    dispatch(clearUser());

    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-16
        items-center
        justify-between
        border-b
        border-white/[0.07]
        bg-[#070b14]/90
        px-4
        backdrop-blur-xl
        sm:px-6
        lg:px-8
      "
    >

      {/* =================================================
          LEFT
      ================================================= */}

      <div className="flex min-w-0 items-center gap-3">

        {/* =================================================
            MOBILE MENU BUTTON

            Below 1024px:
            visible

            1024px+:
            hidden
        ================================================= */}

        <button
          type="button"
          aria-label="Open menu"
          onClick={() =>
            setMobileOpen(true)
          }
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            text-slate-400
            hover:bg-white/[0.05]
            hover:text-white
            lg:hidden
          "
        >
          ☰
        </button>

        {/* =================================================
            SEARCH

            Desktop only
        ================================================= */}

        <div
          className="
            hidden
            w-[280px]
            md:block
            lg:w-[380px]
          "
        >
          <div className="relative">

            <span
              className="
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-sm
                text-slate-600
              "
            >
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search Genome..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="
                h-10
                w-full
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.02]
                pl-10
                pr-4
                text-sm
                text-white
                outline-none
                placeholder:text-slate-600
                focus:border-purple-500/40
              "
            />

            {/* SEARCH DROPDOWN */}

            {searchQuery.trim() && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-12
                  z-50
                  max-h-[500px]
                  overflow-y-auto
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-[#0d1320]
                  shadow-2xl
                  shadow-black/40
                "
              >

                {searchLoading && (
                  <div className="p-5 text-center text-sm text-slate-500">
                    Searching...
                  </div>
                )}

                {!searchLoading &&
                  searchResults && (
                    <>

                      {/* PROJECTS */}

                      {searchResults.projects
                        ?.length > 0 && (
                        <div className="p-3">

                          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Projects
                          </p>

                          {searchResults.projects.map(
                            (project) => (
                              <button
                                key={
                                  project._id
                                }
                                type="button"
                                onClick={() =>
                                  handleSearchNavigation(
                                    "/projects"
                                  )
                                }
                                className="
                                  block
                                  w-full
                                  rounded-lg
                                  px-3
                                  py-2
                                  text-left
                                  text-sm
                                  text-slate-300
                                  transition
                                  hover:bg-white/5
                                  hover:text-white
                                "
                              >
                                <span className="mr-2">
                                  📁
                                </span>

                                {project.name}
                              </button>
                            )
                          )}

                        </div>
                      )}

                      {/* TASKS */}

                      {searchResults.tasks
                        ?.length > 0 && (
                        <div className="border-t border-white/5 p-3">

                          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Tasks
                          </p>

                          {searchResults.tasks.map(
                            (task) => (
                              <button
                                key={
                                  task._id
                                }
                                type="button"
                                onClick={() =>
                                  handleSearchNavigation(
                                    "/tasks"
                                  )
                                }
                                className="
                                  block
                                  w-full
                                  rounded-lg
                                  px-3
                                  py-2
                                  text-left
                                  text-sm
                                  text-slate-300
                                  transition
                                  hover:bg-white/5
                                  hover:text-white
                                "
                              >
                                <span className="mr-2">
                                  ✓
                                </span>

                                {task.title}

                                {task.project
                                  ?.name && (
                                  <span className="ml-2 text-xs text-slate-600">
                                    ·{" "}
                                    {
                                      task
                                        .project
                                        .name
                                    }
                                  </span>
                                )}
                              </button>
                            )
                          )}

                        </div>
                      )}

                      {/* ISSUES */}

                      {searchResults.issues
                        ?.length > 0 && (
                        <div className="border-t border-white/5 p-3">

                          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Issues
                          </p>

                          {searchResults.issues.map(
                            (issue) => (
                              <button
                                key={
                                  issue._id
                                }
                                type="button"
                                onClick={() =>
                                  handleSearchNavigation(
                                    "/issues"
                                  )
                                }
                                className="
                                  block
                                  w-full
                                  rounded-lg
                                  px-3
                                  py-2
                                  text-left
                                  text-sm
                                  text-slate-300
                                  transition
                                  hover:bg-white/5
                                  hover:text-white
                                "
                              >
                                <span className="mr-2">
                                  !
                                </span>

                                {issue.title}

                                {issue.project
                                  ?.name && (
                                  <span className="ml-2 text-xs text-slate-600">
                                    ·{" "}
                                    {
                                      issue
                                        .project
                                        .name
                                    }
                                  </span>
                                )}
                              </button>
                            )
                          )}

                        </div>
                      )}

                      {/* DOCUMENTS */}

                      {searchResults.documents
                        ?.length > 0 && (
                        <div className="border-t border-white/5 p-3">

                          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Documents
                          </p>

                          {searchResults.documents.map(
                            (document) => (
                              <a
                                key={
                                  document._id
                                }
                                href={
                                  document.fileUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => {
                                  setSearchQuery(
                                    ""
                                  );

                                  setSearchResults(
                                    null
                                  );
                                }}
                                className="
                                  block
                                  rounded-lg
                                  px-3
                                  py-2
                                  text-sm
                                  text-slate-300
                                  transition
                                  hover:bg-white/5
                                  hover:text-white
                                "
                              >
                                <span className="mr-2">
                                  📄
                                </span>

                                {
                                  document.originalName ||
                                  document.name
                                }

                                {document.project
                                  ?.name && (
                                  <span className="ml-2 text-xs text-slate-600">
                                    ·{" "}
                                    {
                                      document
                                        .project
                                        .name
                                    }
                                  </span>
                                )}
                              </a>
                            )
                          )}

                        </div>
                      )}

                      {/* NO RESULTS */}

                      {!searchResults.projects
                        ?.length &&
                        !searchResults.tasks
                          ?.length &&
                        !searchResults.issues
                          ?.length &&
                        !searchResults.documents
                          ?.length && (
                          <div className="p-6 text-center">

                            <p className="text-sm text-slate-400">
                              No results found
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              Try another search
                            </p>

                          </div>
                        )}

                    </>
                  )}

              </div>
            )}

          </div>
        </div>

        {/* =================================================
            MOBILE GENOME LOGO

            Below 1024px:
            visible

            1024px+:
            hidden
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard")
          }
          className="
            flex
            shrink-0
            items-center
            gap-2
            lg:hidden
          "
        >

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-purple-500/10
              text-purple-400
            "
          >
            🧬
          </div>

          <span className="font-bold">
            GENOME
          </span>

        </button>

      </div>

      {/* =================================================
          RIGHT
      ================================================= */}

      <div
        className="
          flex
          shrink-0
          items-center
          gap-2
          sm:gap-3
        "
      >

        {/* Notifications */}

        <NotificationBell />

        {/* Profile */}

        <button
          type="button"
          onClick={() =>
            navigate("/settings")
          }
          className="
            flex
            h-10
            items-center
            gap-2
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            px-2
            transition
            hover:bg-white/[0.05]
            sm:px-3
          "
        >

          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                bg-purple-500/10
                text-xs
                font-semibold
                text-purple-400
              "
            >
              {getInitials()}
            </span>
          )}

          <span
            className="
              hidden
              max-w-[120px]
              truncate
              text-sm
              text-slate-300
              sm:block
            "
          >
            {user?.firstName || "Profile"}
          </span>

        </button>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          className="
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            px-3
            py-2
            text-sm
            text-slate-400
            transition
            hover:border-red-500/20
            hover:bg-red-500/5
            hover:text-red-400
          "
        >
          Logout
        </button>

      </div>

    </header>
  );
};

export default Topbar;