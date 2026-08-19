import api from "./api";

// =====================================================
// GET MY PROFILE
// =====================================================

export const getMyProfile = async () => {
  const response = await api.get(
    "/user/profile"
  );

  return response.data;
};

// =====================================================
// UPDATE MY PROFILE
// =====================================================

export const updateMyProfile = async (
  profileData
) => {
  const response = await api.put(
    "/user/profile",
    profileData
  );

  return response.data;
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword = async (
  passwordData
) => {
  const response = await api.put(
    "/user/change-password",
    passwordData
  );

  return response.data;
};

// =====================================================
// UPDATE PROFILE PICTURE
// =====================================================

export const updateProfilePicture = async (
  file
) => {
  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response = await api.put(
    "/user/profile-picture",
    formData
  );

  return response.data;
};

// =====================================================
// DELETE MY ACCOUNT
// =====================================================

export const deleteMyAccount = async (
  password
) => {
  const response = await api.delete(
    "/user/account",
    {
      data: {
        password,
      },
    }
  );

  return response.data;
};