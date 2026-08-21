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
import ProtectedRoute from "./routes/ProtectedRoute";

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
import AI from "./pages/AI";
import CodeLab from "./pages/CodeLab";

// =====================================================
// ERROR PAGES
// =====================================================

import NotFound from "./pages/NotFound";

function App() {
  const dispatch = useDispatch();

  const [authLoading, setAuthLoading] =
    useState(true);

  // =====================================================
  // RESTORE USER AFTER PAGE REFRESH
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const restoreUser = async () => {
      // =================================================
      // GET TOKEN FROM LOCAL STORAGE
      // =================================================

      const token =
        localStorage.getItem("token");

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
        const response =
          await getCurrentUser();

        const user =
          response?.data?.user;

        if (user && isMounted) {
          dispatch(setUser(user));
        }
      } catch (error) {
        console.error(
          "Failed to restore user:",
          error
        );

        const status =
          error?.response?.status;

        // =================================================
        // INVALID / EXPIRED TOKEN
        // =================================================

        if (
          status === 401 ||
          status === 403
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

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
          DEFAULT ROUTE
      ================================================= */}

      <Route
        path="/"
        element={
          localStorage.getItem("token") ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* =================================================
          AUTH ROUTES
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
          PROTECTED APPLICATION ROUTES
      ================================================= */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* =================================================
              PROJECTS
          ================================================= */}

          <Route
            path="/projects"
            element={<Projects />}
          />

          {/* =================================================
              TASKS
          ================================================= */}

          <Route
            path="/tasks"
            element={<Tasks />}
          />

          {/* =================================================
              ISSUES
          ================================================= */}

          <Route
            path="/issues"
            element={<Issues />}
          />

          {/* =================================================
              TEAM
          ================================================= */}

          <Route
            path="/team"
            element={<Team />}
          />

          {/* =================================================
              DOCUMENTS
          ================================================= */}

          <Route
            path="/documents"
            element={<Documents />}
          />

          {/* =================================================
              ACTIVITY
          ================================================= */}

          <Route
            path="/activity"
            element={<Activity />}
          />

          {/* =================================================
              SETTINGS
          ================================================= */}

          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* =================================================
              ANALYTICS
          ================================================= */}

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* =================================================
              AI
          ================================================= */}

          <Route
            path="/ai"
            element={<AI />}
          />

          {/* =================================================
              CODELAB
          ================================================= */}

          <Route
            path="/codelab"
            element={<CodeLab />}
          />
        </Route>
      </Route>

      {/* =================================================
          404 - PAGE NOT FOUND
      ================================================= */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default App;