import { useState } from "react";
import { changePassword } from "../services/userApi";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ---------------------------------------------
    // Validate passwords
    // ---------------------------------------------

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    // ---------------------------------------------
    // Change password
    // ---------------------------------------------

    try {
      setLoading(true);

      const response =
        await changePassword({
          currentPassword,
          newPassword,
        });

      setMessage(
        response?.message ||
          "Password changed successfully."
      );

      // Clear form after success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#0d1320]">

      {/* HEADER */}

      <div className="border-b border-white/[0.07] px-6 py-5">

        <h2 className="font-semibold">
          Change Password
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Keep your Genome account secure.
        </p>

      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-6"
      >

        {/* SUCCESS */}

        {message && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* CURRENT PASSWORD */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Current password
          </label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
            placeholder="Enter current password"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />

        </div>

        {/* NEW PASSWORD */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">
            New password
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            placeholder="Enter new password"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />

        </div>

        {/* CONFIRM PASSWORD */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Confirm new password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />

        </div>

        {/* BUTTON */}

        <div className="flex justify-end">

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Changing..."
              : "Change Password"}
          </button>

        </div>

      </form>

    </section>
  );
};

export default ChangePassword;