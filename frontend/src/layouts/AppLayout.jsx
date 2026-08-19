import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import useSocket from "../hooks/useSocket";

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  useSocket();

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className="
          min-h-screen
          w-full
          min-w-0
          lg:ml-72
          lg:w-[calc(100%-18rem)]
        "
      >
        <Topbar
          setMobileOpen={setMobileOpen}
        />

        <main className="min-w-0 w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AppLayout;