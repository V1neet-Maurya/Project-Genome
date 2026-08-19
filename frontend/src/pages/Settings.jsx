import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import EditProfile from "../components/EditProfile";
import ChangePassword from "../components/ChangePassword";

import { deleteMyAccount } from "../services/userApi";
import { clearUser } from "../redux/userSlice";

const Settings = () => {
  const dispatch = useDispatch();

  // =====================================================
  // DELETE ACCOUNT STATE
  // =====================================================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deletePassword, setDeletePassword] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  // =====================================================
  // OPEN DELETE MODAL
  // =====================================================

  const openDeleteModal = () => {
    setDeletePassword("");
    setShowDeleteModal(true);
  };

  // =====================================================
  // CLOSE DELETE MODAL
  // =====================================================

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setDeletePassword("");
  };

  // =====================================================
  // DELETE ACCOUNT
  // =====================================================

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error("Enter your password");
      return;
    }

    try {
      setDeleting(true);

      await deleteMyAccount(
        deletePassword
      );

      // Clear Redux user
      dispatch(clearUser());

      // Remove authentication token
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // Close modal
      setShowDeleteModal(false);
      setDeletePassword("");

      toast.success(
        "Account deleted successfully"
      );

      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete account"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">

          <p className="mb-2 text-sm font-medium text-purple-400">
            Account
          </p>

          <h1 className="text-3xl font-bold">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your account and preferences.
          </p>

        </div>


        {/* =====================================================
            EDIT PROFILE
        ===================================================== */}

        <div>
          <EditProfile />
        </div>


        {/* =====================================================
            CHANGE PASSWORD
        ===================================================== */}

        <div className="mt-6">
          <ChangePassword />
        </div>


        {/* =====================================================
            ACCOUNT
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0d1320]">

          <div className="border-b border-white/[0.07] px-6 py-5">

            <h2 className="font-semibold">
              Account
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account security.
            </p>

          </div>


          <div>

            {/* =================================================
                DELETE ACCOUNT BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={openDeleteModal}
              className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-red-500/[0.03]"
            >

              <div>

                <p className="text-sm font-medium text-red-400">
                  Delete account
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Permanently delete your Genome account.
                </p>

              </div>

              <span className="text-red-400">
                →
              </span>

            </button>

          </div>

        </section>

      </div>


      {/* =====================================================
          DELETE ACCOUNT MODAL
      ===================================================== */}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >

          <div
            className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0d1320] p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                MODAL TITLE
            ================================================= */}

            <h2 className="text-xl font-semibold text-white">
              Delete your account?
            </h2>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p className="mt-2 text-sm leading-6 text-slate-400">
              This action is permanent. Your account
              will be deleted and you will be logged out.
            </p>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="mt-5">

              <label className="mb-2 block text-sm text-slate-400">
                Enter your password
              </label>

              <input
                type="password"
                value={deletePassword}
                onChange={(e) =>
                  setDeletePassword(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !deleting
                  ) {
                    handleDeleteAccount();
                  }
                }}
                placeholder="Your password"
                disabled={deleting}
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none focus:border-red-500"
              />

            </div>


            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="mt-6 flex justify-end gap-3">

              {/* CANCEL */}

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>


              {/* DELETE */}

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  deleting ||
                  !deletePassword.trim()
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Account"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Settings;