import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { loginUser } from "../../services/authApi";
import { setUser } from "../../redux/userSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      // =========================================
      // CHECK BACKEND RESPONSE
      // =========================================

      if (
        !data?.success ||
        !data?.data?.user ||
        !data?.data?.token
      ) {
        throw new Error(
          data?.message ||
            "Invalid login response"
        );
      }

      const user = data.data.user;
      const token = data.data.token;

      // =========================================
      // SAVE TOKEN PER BROWSER TAB
      // =========================================

      sessionStorage.setItem(
        "token",
        token
      );

      // =========================================
      // SAVE USER IN REDUX
      // =========================================

      dispatch(setUser(user));

      // =========================================
      // GO TO DASHBOARD
      // =========================================

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060b17] px-4">
      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="mb-8 text-center">

          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">

            <span className="text-2xl font-bold text-white">
              G
            </span>

          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Welcome to Genome
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage your projects
            and tasks
          </p>

        </div>

        {/* Login Card */}

        <div className="glass rounded-2xl p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Error */}

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Email */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* Password */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* Login button */}

            <button
              type="submit"
              disabled={
                loading ||
                !email.trim() ||
                !password
              }
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>

          </form>

          {/* Signup */}

          <p className="mt-6 text-center text-sm text-slate-400">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Create account
            </Link>

          </p>

        </div>

      </div>
    </div>
  );
}

export default Login;