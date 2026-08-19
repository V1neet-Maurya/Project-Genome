import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      name: "Projects",
      path: "/projects",
      icon: "▣",
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: "✓",
    },
    {
      name: "Issues",
      path: "/issues",
      icon: "!",
    },
    {
      name: "Team",
      path: "/team",
      icon: "♙",
    },
    {
      name: "Documents",
      path: "/documents",
      icon: "▤",
    },
    {
      name: "Activity",
      path: "/activity",
      icon: "◷",
    },
  ];

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || "";
    const last = user?.lastName?.charAt(0) || "";

    return first + last || "U";
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =====================================================
          DESKTOP SIDEBAR

          Only visible at 1024px and above
      ===================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-64
          flex-col
          border-r
          border-white/[0.07]
          bg-[#090d17]
          shadow-xl
          lg:flex
        "
      >
        {/* LOGO */}

        <div className="flex h-16 shrink-0 items-center border-b border-white/[0.07] px-5">
          <div
            onClick={() => navigate("/dashboard")}
            className="flex cursor-pointer items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-lg text-purple-400">
              🧬
            </div>

            <span className="text-lg font-bold text-white">
              GENOME
            </span>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
            Workspace
          </p>

          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-purple-500/10 text-purple-400"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] text-xs">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="my-5 border-t border-white/[0.06]" />

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
            Account
          </p>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-purple-500/10 text-purple-400"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`
            }
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] text-xs">
              ⚙
            </span>

            <span>Settings</span>
          </NavLink>
        </nav>

        {/* USER */}

        <div className="shrink-0 border-t border-white/[0.07] p-4">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex w-full items-center gap-3 rounded-xl bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
          >
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs font-semibold text-purple-400">
                {getInitials().toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : "User"}
              </p>

              <p className="truncate text-xs text-slate-600">
                {user?.email || "Genome account"}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MOBILE DRAWER

          Only available below 1024px
      ===================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-[100]
          flex
          w-[280px]
          flex-col
          border-r
          border-white/[0.07]
          bg-[#090d17]
          shadow-2xl
          transition-transform
          duration-300
          ease-in-out
          lg:hidden
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* MOBILE HEADER */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-lg text-purple-400">
              🧬
            </div>

            <span className="text-lg font-bold text-white">
              GENOME
            </span>
          </div>

          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* MOBILE NAVIGATION */}

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
            Workspace
          </p>

          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-purple-500/10 text-purple-400"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] text-xs">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="my-5 border-t border-white/[0.06]" />

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
            Account
          </p>

          <NavLink
            to="/settings"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-purple-500/10 text-purple-400"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`
            }
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] text-xs">
              ⚙
            </span>

            <span>Settings</span>
          </NavLink>
        </nav>

        {/* MOBILE USER */}

        <div className="shrink-0 border-t border-white/[0.07] p-4">
          <button
            type="button"
            onClick={() => {
              navigate("/settings");
              closeMobileSidebar();
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
          >
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs font-semibold text-purple-400">
                {getInitials().toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : "User"}
              </p>

              <p className="truncate text-xs text-slate-600">
                {user?.email || "Genome account"}
              </p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;