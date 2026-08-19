


import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { getProjects } from "../services/projectApi";

import {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
} from "../services/teamApi";

import {
  setMembers,
  setLoading,
  setError,
} from "../redux/teamSlice";

const Team = () => {
  const dispatch = useDispatch();

  // =====================================================
  // REDUX
  // =====================================================

  const {
    members = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.team || {});

  const user = useSelector(
    (state) => state.user?.user
  );

  // =====================================================
  // STATE
  // =====================================================

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] =
    useState("");

  const [projectDropdownOpen, setProjectDropdownOpen] =
    useState(false);

  const projectDropdownRef = useRef(null);

  const [showAddMember, setShowAddMember] =
    useState(false);

  const [memberEmail, setMemberEmail] =
    useState("");

  const [memberRole, setMemberRole] =
    useState("developer");

  const [search, setSearch] = useState("");

  // =====================================================
  // ID HELPER
  // Handles:
  // ObjectId
  // string
  // populated object
  // {_id}
  // {id}
  // =====================================================

  const getId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "object") {
      if (value._id) {
        return value._id.toString();
      }

      if (value.id) {
        return value.id.toString();
      }

      return null;
    }

    return value.toString();
  };

  // =====================================================
  // CURRENT PROJECT
  // =====================================================

  const currentProject = useMemo(() => {
    return projects.find(
      (project) =>
        getId(project?._id) ===
        getId(selectedProject)
    );
  }, [projects, selectedProject]);

  // =====================================================
  // CLOSE PROJECT DROPDOWN WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setProjectDropdownOpen(false);
      }
    };

    if (projectDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [projectDropdownOpen]);

  // =====================================================
  // CURRENT USER ID
  // =====================================================

  const currentUserId = getId(
    user?._id || user?.id
  );

  // =====================================================
  // PROJECT OWNER ID
  // =====================================================

  const projectOwnerId = getId(
    currentProject?.owner
  );

  // =====================================================
  // CURRENT USER ROLE
  // =====================================================

  const currentUserProjectRole = useMemo(() => {
    if (!currentProject || !currentUserId) {
      return null;
    }

    // -------------------------------------------------
    // OWNER
    // -------------------------------------------------

    if (
      projectOwnerId &&
      currentUserId === projectOwnerId
    ) {
      return "owner";
    }

    // -------------------------------------------------
    // CHECK PROJECT MEMBERS
    // -------------------------------------------------

    const projectMembers =
      Array.isArray(currentProject?.members)
        ? currentProject.members
        : [];

    const projectMember =
      projectMembers.find((member) => {
        const memberUserId = getId(
          member?.user
        );

        return (
          memberUserId &&
          memberUserId === currentUserId
        );
      });

    if (projectMember?.role) {
      return projectMember.role;
    }

    // -------------------------------------------------
    // CHECK FETCHED TEAM MEMBERS
    // -------------------------------------------------

    const fetchedMember =
      members.find((member) => {
        const memberUserId = getId(
          member?.user
        );

        return (
          memberUserId &&
          memberUserId === currentUserId
        );
      });

    return fetchedMember?.role || null;
  }, [
    currentProject,
    currentUserId,
    projectOwnerId,
    members,
  ]);

  // =====================================================
  // TEAM PERMISSIONS
  // =====================================================

  const canManageTeam =
    currentUserProjectRole === "owner" ||
    currentUserProjectRole === "admin";

  // =====================================================
  // DEBUG
  // =====================================================

  useEffect(() => {
    console.log("========== TEAM DEBUG ==========");
    console.log("Logged user:", user);
    console.log(
      "Logged user ID:",
      currentUserId
    );
    console.log(
      "Selected project:",
      selectedProject
    );
    console.log(
      "Current project:",
      currentProject
    );
    console.log(
      "Project owner:",
      currentProject?.owner
    );
    console.log(
      "Project owner ID:",
      projectOwnerId
    );
    console.log(
      "Current project role:",
      currentUserProjectRole
    );
    console.log(
      "Can manage team:",
      canManageTeam
    );
    console.log("================================");
  }, [
    user,
    currentUserId,
    selectedProject,
    currentProject,
    projectOwnerId,
    currentUserProjectRole,
    canManageTeam,
  ]);

  // =====================================================
  // GET PROJECTS
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
          Array.isArray(response?.projects)
            ? response.projects
            : Array.isArray(
                response?.data?.projects
              )
            ? response.data.projects
            : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : [];

        console.log(
          "PROJECT LIST:",
          projectList
        );

        setProjects(projectList);

        // Automatically select first project
        if (
          projectList.length > 0 &&
          !selectedProject
        ) {
          setSelectedProject(
            projectList[0]._id
          );
        }

        // If selected project no longer exists
        if (
          selectedProject &&
          !projectList.some(
            (project) =>
              getId(project?._id) ===
              getId(selectedProject)
          )
        ) {
          setSelectedProject(
            projectList[0]?._id || ""
          );
        }
      } catch (error) {
        console.error(
          "GET PROJECTS ERROR:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load projects"
        );
      }
    };

    fetchProjects();

    // IMPORTANT:
    // Do NOT put selectedProject in this dependency array.
  }, []);

  // =====================================================
  // GET MEMBERS
  // =====================================================

  useEffect(() => {
    if (!selectedProject) {
      dispatch(setMembers([]));
      dispatch(setError(null));
      return;
    }

    const fetchMembers = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const response =
          await getProjectMembers(
            selectedProject
          );

        console.log(
          "MEMBERS API RESPONSE:",
          response
        );

        const memberList =
          Array.isArray(response?.data)
            ? response.data
            : Array.isArray(
                response?.data?.members
              )
            ? response.data.members
            : [];

        dispatch(
          setMembers(memberList)
        );
      } catch (error) {
        console.error(
          "GET MEMBERS ERROR:",
          error
        );

        const message =
          error.response?.data?.message ||
          "Failed to load team members";

        dispatch(setError(message));

        toast.error(message);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMembers();
  }, [selectedProject, dispatch]);

  // =====================================================
  // ADD MEMBER
  // =====================================================

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      toast.error(
        "Please select a project"
      );
      return;
    }

    if (!canManageTeam) {
      toast.error(
        "You do not have permission to add members"
      );
      return;
    }

    const normalizedEmail =
      memberEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error(
        "Enter user email"
      );
      return;
    }

    try {
      dispatch(setLoading(true));

      const response =
        await addProjectMember(
          selectedProject,
          {
            email: normalizedEmail,
            role: memberRole,
          }
        );

      console.log(
        "ADD MEMBER RESPONSE:",
        response
      );

      const updatedMembers =
        Array.isArray(response?.data)
          ? response.data
          : [];

      dispatch(
        setMembers(updatedMembers)
      );

      toast.success(
        "Member added successfully"
      );

      setMemberEmail("");
      setMemberRole("developer");
      setShowAddMember(false);
    } catch (error) {
      console.error(
        "ADD MEMBER ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to add member"
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  // =====================================================
  // FILTER MEMBERS
  // =====================================================

  const filteredMembers = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    if (!searchValue) {
      return members;
    }

    return members.filter((member) => {
      const memberUser =
        member?.user;

      const name =
        `${memberUser?.firstName || ""} ${
          memberUser?.lastName || ""
        }`.toLowerCase();

      const email =
        memberUser?.email?.toLowerCase() ||
        "";

      return (
        name.includes(searchValue) ||
        email.includes(searchValue)
      );
    });
  }, [members, search]);

  // =====================================================
  // UPDATE MEMBER ROLE
  // =====================================================

  const handleRoleChange = async (
    userId,
    role
  ) => {
    if (!selectedProject || !userId) {
      toast.error(
        "Invalid member"
      );
      return;
    }

    if (!canManageTeam) {
      toast.error(
        "You do not have permission to update roles"
      );
      return;
    }

    try {
      dispatch(setLoading(true));

      await updateMemberRole(
        selectedProject,
        userId,
        role
      );

      toast.success(
        "Role updated successfully"
      );

      const response =
        await getProjectMembers(
          selectedProject
        );

      const updatedMembers =
        Array.isArray(response?.data)
          ? response.data
          : [];

      dispatch(
        setMembers(updatedMembers)
      );
    } catch (error) {
      console.error(
        "UPDATE ROLE ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update role"
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  // =====================================================
  // REMOVE MEMBER
  // =====================================================

  const handleRemoveMember = async (
    userId,
    fullName
  ) => {
    if (!selectedProject) {
      toast.error(
        "Please select a project"
      );
      return;
    }

    if (!userId) {
      toast.error(
        "This member has an invalid user ID"
      );
      return;
    }

    if (!canManageTeam) {
      toast.error(
        "You do not have permission to remove members"
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${
          fullName || "this member"
        } from this project?`
      );

    if (!confirmed) {
      return;
    }

    try {
      dispatch(setLoading(true));

      await removeProjectMember(
        selectedProject,
        userId
      );

      toast.success(
        "Member removed successfully"
      );

      const response =
        await getProjectMembers(
          selectedProject
        );

      const updatedMembers =
        Array.isArray(response?.data)
          ? response.data
          : [];

      dispatch(
        setMembers(updatedMembers)
      );
    } catch (error) {
      console.error(
        "REMOVE MEMBER ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to remove member"
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeAddMemberModal = () => {
    setMemberEmail("");
    setMemberRole("developer");
    setShowAddMember(false);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">

        {/* HEADER */}

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              👥
            </div>

            <span className="text-sm font-medium text-blue-400">
              Workspace
            </span>
          </div>

          <h1 className="text-3xl font-bold">
            Team
          </h1>

          <p className="mt-2 text-slate-400">
            Manage people working on your
            projects.
          </p>
        </div>

        {/* PROJECT SELECT */}

        <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0d1320] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div className="w-full sm:max-w-md">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Select Project
              </label>

              <div
                ref={projectDropdownRef}
                className="relative w-full"
              >
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={projectDropdownOpen}
                  onClick={() =>
                    setProjectDropdownOpen((prev) => !prev)
                  }
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-white/[0.08] bg-[#080c15] px-4 text-left text-sm text-slate-300 outline-none transition hover:border-white/10 focus:border-purple-500"
                >
                  <span className="min-w-0 truncate">
                    {currentProject?.name || "Select a project"}
                  </span>

                  <span
                    className={`ml-3 shrink-0 text-xs text-slate-500 transition-transform duration-200 ${
                      projectDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {projectDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] max-h-60 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0d1320] p-1 shadow-2xl"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={!selectedProject}
                      onClick={() => {
                        setSelectedProject("");
                        setSearch("");
                        setShowAddMember(false);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-3 text-left text-sm transition ${
                        !selectedProject
                          ? "bg-purple-500/10 text-purple-400"
                          : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      Select a project
                    </button>

                    {projects.length > 0 ? (
                      projects.map((project) => {
                        const projectId = getId(project?._id);
                        const projectName = project?.name || "Unnamed Project";
                        const isSelected =
                          getId(selectedProject) === projectId;

                        return (
                          <button
                            key={projectId}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedProject(projectId || "");
                              setSearch("");
                              setShowAddMember(false);
                              setProjectDropdownOpen(false);
                            }}
                            className={`w-full rounded-lg px-3 py-3 text-left text-sm transition ${
                              isSelected
                                ? "bg-purple-500/10 text-purple-400"
                                : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                            }`}
                          >
                            <span className="block truncate">
                              {projectName}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-3 text-sm text-slate-500">
                        No projects found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ADD MEMBER */}

            {canManageTeam && (
              <button
                type="button"
                disabled={!selectedProject}
                onClick={() =>
                  setShowAddMember(true)
                }
                className="h-11 w-full rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[145px]"
              >
                + Add Member
              </button>
            )}
          </div>

          {/* CURRENT ROLE */}

          {selectedProject && (
            <div className="mt-4 text-xs text-slate-500">
              Your project role:{" "}
              <span className="font-semibold capitalize text-purple-400">
                {currentUserProjectRole ||
                  "No access"}
              </span>
            </div>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* TEAM */}

        {!selectedProject ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
              👥
            </div>

            <h2 className="font-semibold">
              Select a project
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Choose a project to view its
              team members.
            </p>
          </div>
        ) : loading ? (
          <div className="flex min-h-[300px] items-center justify-center text-slate-400">
            Loading team members...
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1320]">

            {/* HEADER */}

            <div className="border-b border-white/[0.07] px-6 py-5">
              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-semibold">
                    Project Members
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {members.length} member
                    {members.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                {canManageTeam && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAddMember(true)
                    }
                    className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-purple-500"
                  >
                    + Add Member
                  </button>
                )}
              </div>
            </div>

            {/* SEARCH */}

            <div className="border-b border-white/[0.07] px-6 py-4">
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search members..."
                className="h-10 w-full rounded-xl border border-white/10 bg-[#080c15] px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
              />
            </div>

            {/* MEMBERS */}

            <div className="divide-y divide-white/[0.06]">

              {filteredMembers.map(
                (member, index) => {
                  const memberUser =
                    member?.user;

                  const memberUserId =
                    getId(memberUser);

                  const fullName =
                    `${memberUser?.firstName || ""} ${
                      memberUser?.lastName || ""
                    }`.trim();

                  const displayName =
                    fullName ||
                    "Unknown User";

                  const displayEmail =
                    memberUser?.email ||
                    "No email";

                  const hasValidUser =
                    Boolean(memberUserId);

                  return (
                    <div
                      key={
                        memberUserId ||
                        member?._id ||
                        `member-${index}`
                      }
                      className="flex flex-col gap-4 px-6 py-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                    >

                      {/* USER */}

                      <div className="flex items-center gap-4">

                        {memberUser?.profilePic ? (
                          <img
                            src={
                              memberUser.profilePic
                            }
                            alt={displayName}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-500/10 font-semibold text-purple-400">
                            {displayName
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <p className="font-medium">
                            {displayName}
                          </p>

                          <p className="text-sm text-slate-500">
                            {displayEmail}
                          </p>

                          {!hasValidUser && (
                            <p className="mt-1 text-xs text-red-400">
                              Invalid user reference
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ROLE + REMOVE */}

                      <div className="flex items-center gap-2">

                        <select
                          value={
                            member.role ||
                            "developer"
                          }
                          disabled={
                            !canManageTeam ||
                            !hasValidUser
                          }
                          onChange={(e) =>
                            handleRoleChange(
                              memberUserId,
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-white/10 bg-[#080c15] px-3 py-2 text-xs capitalize text-slate-300 outline-none focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="admin">
                            Admin
                          </option>

                          <option value="developer">
                            Developer
                          </option>

                          <option value="viewer">
                            Viewer
                          </option>
                        </select>

                        {canManageTeam &&
                          hasValidUser && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveMember(
                                  memberUserId,
                                  displayName
                                )
                              }
                              className="rounded-lg border border-red-500/10 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                            >
                              Remove
                            </button>
                          )}
                      </div>
                    </div>
                  );
                }
              )}

              {filteredMembers.length ===
                0 && (
                <div className="p-12 text-center text-sm text-slate-500">
                  {search
                    ? "No members match your search."
                    : "No members found."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD MEMBER MODAL */}

      {showAddMember && canManageTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1320] p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  Add Member
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a user to this project.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeAddMemberModal
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleAddMember}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  User Email
                </label>

                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) =>
                    setMemberEmail(
                      e.target.value
                    )
                  }
                  placeholder="user@example.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* ROLE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Role
                </label>

                <select
                  value={memberRole}
                  onChange={(e) =>
                    setMemberRole(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm outline-none focus:border-purple-500"
                >
                  <option value="developer">
                    Developer
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                  <option value="viewer">
                    Viewer
                  </option>
                </select>
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                <button
                  type="button"
                  onClick={
                    closeAddMemberModal
                  }
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !memberEmail.trim()
                  }
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Adding..."
                    : "Add Member"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;