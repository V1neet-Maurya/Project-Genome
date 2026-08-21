import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  House,
  BriefcaseBusiness,
  SquareCheckBig,
  Bug,
  UsersRound,
  FileText,
  Activity,
  Settings,
  Sparkles,
  UserRound,
  ChevronRight,
  BrainCircuit,
} from "lucide-react";

const Sidebar = ({
  mobileOpen,
  setMobileOpen,
}) => {
  const navigate = useNavigate();

  const { user } = useSelector(
    (state) => state.user
  );

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: House,

      iconColor: "text-violet-200",

      iconBg:
        "bg-gradient-to-br from-violet-500/30 to-purple-600/20 border-violet-400/30 shadow-[0_0_22px_rgba(139,92,246,0.25)]",

      active:
        "border-violet-500/30 bg-gradient-to-r from-violet-500/[0.16] to-purple-500/[0.06] shadow-[0_0_25px_rgba(139,92,246,0.12)]",

      activeText: "text-violet-300",
    },

    {
      name: "Projects",
      path: "/projects",
      icon: BriefcaseBusiness,

      iconColor: "text-blue-200",

      iconBg:
        "bg-gradient-to-br from-blue-500/30 to-cyan-500/10 border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.18)]",

      active:
        "border-blue-500/30 bg-blue-500/[0.07]",

      activeText: "text-blue-300",
    },

    {
      name: "Tasks",
      path: "/tasks",
      icon: SquareCheckBig,

      iconColor: "text-emerald-200",

      iconBg:
        "bg-gradient-to-br from-emerald-500/30 to-green-500/10 border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.16)]",

      active:
        "border-emerald-500/30 bg-emerald-500/[0.07]",

      activeText: "text-emerald-300",
    },

    {
      name: "Issues",
      path: "/issues",
      icon: Bug,

      iconColor: "text-rose-200",

      iconBg:
        "bg-gradient-to-br from-rose-500/30 to-red-500/10 border-rose-400/30 shadow-[0_0_20px_rgba(244,63,94,0.18)]",

      active:
        "border-rose-500/30 bg-rose-500/[0.07]",

      activeText: "text-rose-300",
    },

    {
      name: "Team",
      path: "/team",
      icon: UsersRound,

      iconColor: "text-purple-200",

      iconBg:
        "bg-gradient-to-br from-purple-500/30 to-fuchsia-500/10 border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.18)]",

      active:
        "border-purple-500/30 bg-purple-500/[0.07]",

      activeText: "text-purple-300",
    },

    {
      name: "Documents",
      path: "/documents",
      icon: FileText,

      iconColor: "text-amber-200",

      iconBg:
        "bg-gradient-to-br from-amber-500/30 to-yellow-500/10 border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.18)]",

      active:
        "border-amber-500/30 bg-amber-500/[0.07]",

      activeText: "text-amber-300",
    },

    {
      name: "Activity",
      path: "/activity",
      icon: Activity,

      iconColor: "text-cyan-200",

      iconBg:
        "bg-gradient-to-br from-cyan-500/30 to-sky-500/10 border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.18)]",

      active:
        "border-cyan-500/30 bg-cyan-500/[0.07]",

      activeText: "text-cyan-300",
    },

    // =====================================================
    // GENOME AI
    // =====================================================

    {
      name: "Genome AI",
      path: "/ai",
      icon: BrainCircuit,

      iconColor: "text-fuchsia-200",

      iconBg:
        "bg-gradient-to-br from-fuchsia-500/30 to-violet-500/10 border-fuchsia-400/30 shadow-[0_0_22px_rgba(217,70,239,0.20)]",

      active:
        "border-fuchsia-500/30 bg-fuchsia-500/[0.07]",

      activeText: "text-fuchsia-300",
    },
  ];

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
  // CLOSE MOBILE
  // =====================================================

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  // =====================================================
  // NAV ITEM
  // =====================================================

  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={closeMobileSidebar}
        className={({ isActive }) => `
          group
          flex
          w-full
          items-center
          gap-3
          rounded-2xl
          border
          px-3
          py-3
          transition-all
          duration-200

          ${
            isActive
              ? item.active
              : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.025]"
          }
        `}
      >
        {({ isActive }) => (
          <>
            {/* ICON */}

            <div
              className={`
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                transition-all
                duration-200

                ${
                  isActive
                    ? item.iconBg
                    : `${item.iconBg} opacity-80 group-hover:opacity-100`
                }
              `}
            >
              <Icon
                size={23}
                strokeWidth={2}
                className={
                  isActive
                    ? item.iconColor
                    : `${item.iconColor} group-hover:scale-105`
                }
              />
            </div>

            {/* TEXT */}

            <span
              className={`
                flex-1
                text-[15px]
                font-semibold
                transition-colors

                ${
                  isActive
                    ? item.activeText
                    : "text-slate-400 group-hover:text-slate-200"
                }
              `}
            >
              {item.name}
            </span>

            {/* CHEVRON */}

            <ChevronRight
              size={18}
              strokeWidth={2}
              className={`
                shrink-0
                transition-all
                duration-200

                ${
                  isActive
                    ? `${item.iconColor} translate-x-0 opacity-100`
                    : "translate-x-[-4px] text-slate-700 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }
              `}
            />
          </>
        )}
      </NavLink>
    );
  };

  // =====================================================
  // SIDEBAR CONTENT
  // =====================================================

  const SidebarContent = ({
    mobile = false,
  }) => {
    return (
      <div className="flex h-full flex-col">

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="flex h-[88px] shrink-0 items-center border-b border-white/[0.07] px-5">

          <button
            type="button"
            onClick={() => {
              navigate("/dashboard");

              if (mobile) {
                closeMobileSidebar();
              }
            }}
            className="group flex items-center gap-3"
          >

            {/* LOGO */}

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                border-violet-500/20
                bg-gradient-to-br
                from-violet-500/20
                to-purple-500/5
                shadow-[0_0_25px_rgba(139,92,246,0.15)]
              "
            >
              <span className="text-2xl">
                🧬
              </span>
            </div>

            {/* NAME */}

            <div className="text-left">
              <p className="text-[21px] font-extrabold tracking-tight text-white">
                GENOME
              </p>

              <p className="text-[9px] font-medium tracking-[0.16em] text-slate-600">
                MANAGE · TRACK · SUCCEED
              </p>
            </div>

          </button>

          {mobile && (
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-500 hover:bg-white/[0.05] hover:text-white"
            >
              ×
            </button>
          )}

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-7">

          {/* WORKSPACE */}

          <div className="mb-4 flex items-center gap-2 px-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.17em] text-slate-600">
              Workspace
            </p>

            <Sparkles
              size={15}
              className="text-violet-500"
            />
          </div>

          <div className="space-y-2">
            {navItems.map(
              renderNavItem
            )}
          </div>

          {/* DIVIDER */}

          <div className="my-7 border-t border-white/[0.06]" />

          {/* ACCOUNT */}

          <div className="mb-4 flex items-center gap-2 px-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.17em] text-slate-600">
              Account
            </p>

            <UserRound
              size={15}
              className="text-violet-500"
            />
          </div>

          {/* SETTINGS */}

          <NavLink
            to="/settings"
            onClick={closeMobileSidebar}
            className={({ isActive }) => `
              group
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              border
              px-3
              py-3
              transition

              ${
                isActive
                  ? "border-slate-500/20 bg-slate-500/[0.08]"
                  : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.025]"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-400/20
                    bg-gradient-to-br
                    from-slate-400/20
                    to-slate-600/10
                    text-slate-200
                  "
                >
                  <Settings
                    size={23}
                  />
                </div>

                <span
                  className={`
                    flex-1
                    text-[15px]
                    font-semibold
                    ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-200"
                    }
                  `}
                >
                  Settings
                </span>

                <ChevronRight
                  size={18}
                  className="text-slate-700 group-hover:text-slate-400"
                />
              </>
            )}
          </NavLink>

        </nav>

        {/* =================================================
            PROFILE
        ================================================= */}

        <div className="shrink-0 border-t border-white/[0.07] p-3">

          <button
            type="button"
            onClick={() => {
              navigate("/settings");

              if (mobile) {
                closeMobileSidebar();
              }
            }}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              border
              border-violet-500/10
              bg-gradient-to-br
              from-violet-500/[0.08]
              to-transparent
              p-3
              text-left
              transition

              hover:border-violet-500/20
              hover:from-violet-500/[0.12]
            "
          >

            {/* AVATAR */}

            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="
                  h-12
                  w-12
                  shrink-0
                  rounded-full
                  object-cover
                  ring-2
                  ring-violet-500/20
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  text-sm
                  font-bold
                  text-violet-300
                  ring-2
                  ring-violet-500/10
                "
              >
                {getInitials()}
              </div>
            )}

            {/* USER */}

            <div className="min-w-0 flex-1">

              <div className="flex min-w-0 items-center gap-2">

                <p className="truncate text-sm font-bold text-white">
                  {user?.firstName
                    ? `${user.firstName} ${
                        user.lastName || ""
                      }`
                    : "User"}
                </p>

                {user?.role && (
                  <span className="hidden rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-300 sm:inline-block">
                    {user.role}
                  </span>
                )}

              </div>

              <p className="mt-0.5 truncate text-xs text-slate-600">
                {user?.email ||
                  "Genome account"}
              </p>

            </div>

            <ChevronRight
              size={18}
              className="shrink-0 text-slate-700"
            />

          </button>

        </div>

      </div>
    );
  };

  return (
    <>
      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="
            fixed
            inset-0
            z-[90]
            bg-black/70
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* DESKTOP */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-72
          flex-col
          border-r
          border-white/[0.07]
          bg-[#070b14]
          lg:flex
        "
      >
        <SidebarContent />
      </aside>

      {/* MOBILE */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-[100]
          flex
          w-[290px]
          flex-col
          border-r
          border-white/[0.07]
          bg-[#070b14]
          shadow-2xl
          transition-transform
          duration-300
          lg:hidden

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <SidebarContent mobile />
      </aside>
    </>
  );
};

export default Sidebar;