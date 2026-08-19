import { useEffect, useState } from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import NotificationBell from "./NotificationBell";

import { globalSearch } from "../services/searchApi";

const Navbar = () => {
  const navigate = useNavigate();

  // =====================================================
  // SEARCH STATE
  // =====================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState(null);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Projects",
      path: "/projects",
    },
    {
      name: "Tasks",
      path: "/tasks",
    },
    {
      name: "Issues",
      path: "/issues",
    },
    {
      name: "Team",
      path: "/team",
    },
  ];

  // =====================================================
  // GLOBAL SEARCH
  // =====================================================

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(
      async () => {
        try {
          const response =
            await globalSearch(
              searchQuery.trim()
            );

          setSearchResults(
            response?.data || null
          );
        } catch (error) {
          console.error(
            "Search error:",
            error
          );

          setSearchResults(null);
        }
      },
      400
    );

    return () =>
      clearTimeout(timer);
  }, [searchQuery]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    // Remove current tab's authentication token
    sessionStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // CLOSE SEARCH
  // =====================================================

  const closeSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  return (
    <nav className="border-b border-white/[0.07] bg-[#080c15]">

      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/15 text-lg text-purple-400">
            🧬
          </div>

          <span className="text-lg font-bold tracking-tight">
            GENOME
          </span>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="hidden items-center gap-1 md:flex">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-purple-500/10 text-purple-400"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="relative hidden w-64 lg:block">

          <input
            type="text"
            placeholder="Search Genome..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-purple-500/40 focus:bg-white/[0.04]"
          />

          {/* =================================================
              SEARCH DROPDOWN
          ================================================= */}

          {searchResults && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] max-h-[500px] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d1320] shadow-2xl shadow-black/40">

              {/* =================================================
                  PROJECTS
              ================================================= */}

              {searchResults.projects?.length >
                0 && (
                <div className="p-3">

                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Projects
                  </p>

                  {searchResults.projects.map(
                    (project) => (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => {
                          navigate(
                            "/projects"
                          );
                          closeSearch();
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        📁{" "}
                        {project.name}
                      </button>
                    )
                  )}

                </div>
              )}

              {/* =================================================
                  TASKS
              ================================================= */}

              {searchResults.tasks?.length >
                0 && (
                <div className="border-t border-white/5 p-3">

                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tasks
                  </p>

                  {searchResults.tasks.map(
                    (task) => (
                      <button
                        key={task._id}
                        type="button"
                        onClick={() => {
                          navigate(
                            "/tasks"
                          );
                          closeSearch();
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        ✓{" "}
                        {task.title}
                      </button>
                    )
                  )}

                </div>
              )}

              {/* =================================================
                  ISSUES
              ================================================= */}

              {searchResults.issues?.length >
                0 && (
                <div className="border-t border-white/5 p-3">

                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Issues
                  </p>

                  {searchResults.issues.map(
                    (issue) => (
                      <button
                        key={issue._id}
                        type="button"
                        onClick={() => {
                          navigate(
                            "/issues"
                          );
                          closeSearch();
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        !{" "}
                        {issue.title}
                      </button>
                    )
                  )}

                </div>
              )}

              {/* =================================================
                  DOCUMENTS
              ================================================= */}

              {searchResults.documents?.length >
                0 && (
                <div className="border-t border-white/5 p-3">

                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Documents
                  </p>

                  {searchResults.documents.map(
                    (document) => (
                      <a
                        key={document._id}
                        href={
                          document.fileUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        onClick={
                          closeSearch
                        }
                        className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        📄{" "}
                        {document.originalName ||
                          document.name}
                      </a>
                    )
                  )}

                </div>
              )}

              {/* =================================================
                  NO RESULTS
              ================================================= */}

              {!searchResults.projects
                ?.length &&
                !searchResults.tasks
                  ?.length &&
                !searchResults.issues
                  ?.length &&
                !searchResults.documents
                  ?.length && (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No results found
                  </div>
                )}

            </div>
          )}

        </div>

        {/* =================================================
            NOTIFICATION + LOGOUT
        ================================================= */}

        <div className="flex items-center gap-3">

          <NotificationBell />

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/[0.07] px-4 py-2 text-sm text-slate-400 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
          >
            Logout
          </button>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;