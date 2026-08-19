import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { useDispatch } from "react-redux";

import AppLayout from "./layouts/AppLayout";

import {
  getCurrentUser,
} from "./services/authApi";

import {
  setUser,
  clearUser,
} from "./redux/userSlice";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// =====================================================
// APPLICATION PAGES
// =====================================================

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Issues from "./pages/Issues";
import Team from "./pages/Team";
import Documents from "./pages/Documents";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";

function App() {
  const dispatch = useDispatch();

  const [authLoading, setAuthLoading] = useState(true);

  // =====================================================
  // RESTORE USER AFTER PAGE REFRESH
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const restoreUser = async () => {
      const token = sessionStorage.getItem("token");

      // =================================================
      // NO TOKEN
      // =================================================

      if (!token) {
        if (isMounted) {
          dispatch(clearUser());
          setAuthLoading(false);
        }

        return;
      }

      // =================================================
      // TOKEN EXISTS
      // =================================================

      try {
        const response = await getCurrentUser();

        const user = response?.data?.user;

        if (user && isMounted) {
          dispatch(setUser(user));
        }
      } catch (error) {
        console.error(
          "Failed to restore user:",
          error
        );

        const status = error?.response?.status;

        // =================================================
        // INVALID / EXPIRED TOKEN
        // =================================================

        if (status === 401 || status === 403) {
          sessionStorage.removeItem("token");

          if (isMounted) {
            dispatch(clearUser());
          }
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    restoreUser();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // =====================================================
  // AUTH LOADING
  // =====================================================

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060b17]">
        <div className="text-lg text-white">
          Loading Genome...
        </div>
      </div>
    );
  }

  // =====================================================
  // ROUTES
  // =====================================================

  return (
    <Routes>

      {/* =================================================
          DEFAULT
      ================================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* =================================================
          AUTH
      ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* =================================================
          APPLICATION
      ================================================= */}

      <Route element={<AppLayout />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/tasks"
          element={<Tasks />}
        />

        <Route
          path="/issues"
          element={<Issues />}
        />

        <Route
          path="/team"
          element={<Team />}
        />

        <Route
          path="/documents"
          element={<Documents />}
        />

        <Route
          path="/activity"
          element={<Activity />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

      </Route>

      {/* =================================================
          UNKNOWN ROUTE
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;