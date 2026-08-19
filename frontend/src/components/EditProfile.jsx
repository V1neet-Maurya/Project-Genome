import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import {
  updateMyProfile,
  updateProfilePicture,
} from "../services/userApi";

import {
  setUser,
} from "../redux/userSlice";

const EditProfile = () => {
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.user
  );

  const [firstName, setFirstName] =
    useState(user?.firstName || "");

  const [lastName, setLastName] =
    useState(user?.lastName || "");

  const [email, setEmail] =
    useState(user?.email || "");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // PROFILE IMAGE STATE
  // =====================================================

  const [profileImage, setProfileImage] =
    useState(null);

  const [imageLoading, setImageLoading] =
    useState(false);

  // =====================================================
  // UPDATE PROFILE IMAGE
  // =====================================================

  const handleProfileImage = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    // ---------------------------------------------
    // Check image type
    // ---------------------------------------------

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select an image file"
      );

      return;
    }

    // ---------------------------------------------
    // Check image size
    // ---------------------------------------------

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Image must be less than 5 MB"
      );

      return;
    }

    // ---------------------------------------------
    // Show local preview immediately
    // ---------------------------------------------

    const previewUrl =
      URL.createObjectURL(file);

    setProfileImage(previewUrl);

    // ---------------------------------------------
    // Upload image
    // ---------------------------------------------

    try {
      setImageLoading(true);

      const response =
        await updateProfilePicture(file);

      // -------------------------------------------
      // Update Redux user
      // -------------------------------------------

      dispatch(
        setUser(response.data)
      );

      // -------------------------------------------
      // Remove local preview
      // Cloudinary URL is now used
      // -------------------------------------------

      URL.revokeObjectURL(
        previewUrl
      );

      setProfileImage(null);

      toast.success(
        "Profile picture updated successfully"
      );
    } catch (error) {
      console.error(
        "Profile picture update error:",
        error
      );

      // Remove failed preview
      URL.revokeObjectURL(
        previewUrl
      );

      setProfileImage(null);

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile picture"
      );
    } finally {
      setImageLoading(false);

      // Allow selecting the same image again
      e.target.value = "";
    }
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error(
        "First name is required"
      );

      return;
    }

    if (!email.trim()) {
      toast.error(
        "Email is required"
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await updateMyProfile({
          firstName,
          lastName,
          email,
        });

      dispatch(
        setUser(response.data)
      );

      toast.success(
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.07] bg-[#0d1320] p-6"
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
          Edit Profile
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Update your personal information.
        </p>

      </div>

      {/* =====================================================
          PROFILE IMAGE
      ===================================================== */}

      <div className="mb-6 flex items-center gap-4">

        <div className="relative h-20 w-20">

          <img
            src={
              profileImage ||
              user?.profilePic ||
              "/default-avatar.png"
            }
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover border border-white/10"
          />

          <label
            className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-purple-600 text-xs shadow-lg transition hover:bg-purple-500"
          >
            {imageLoading ? "..." : "✎"}

            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImage}
              className="hidden"
              disabled={imageLoading}
            />
          </label>

        </div>

        <div>
          <p className="text-sm font-medium text-white">
            Profile picture
          </p>

          <p className="mt-1 text-xs text-slate-500">
            JPG, PNG or WEBP. Maximum 5 MB.
          </p>
        </div>

      </div>

      {/* =====================================================
          NAME
      ===================================================== */}

      <div className="grid gap-5 sm:grid-cols-2">

        {/* FIRST NAME */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            First name
          </label>

          <input
            type="text"
            value={firstName}
            onChange={(e) =>
              setFirstName(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
          />

        </div>

        {/* LAST NAME */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Last name
          </label>

          <input
            type="text"
            value={lastName}
            onChange={(e) =>
              setLastName(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
          />

        </div>

      </div>

      {/* =====================================================
          EMAIL
      ===================================================== */}

      <div className="mt-5">

        <label className="mb-2 block text-sm text-slate-400">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-white/10 bg-[#080c15] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
        />

      </div>

      {/* =====================================================
          SAVE BUTTON
      ===================================================== */}

      <div className="mt-6 flex justify-end">

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>

    </form>
  );
};

export default EditProfile;