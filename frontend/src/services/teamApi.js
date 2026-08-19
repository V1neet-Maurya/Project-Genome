import api from "./api";

export const getProjectMembers = async (projectId) => {
  const response = await api.get(
    `/team/${projectId}`
  );

  return response.data;
};

export const addProjectMember = async (
  projectId,
  memberData
) => {
  const response = await api.post(
    `/team/${projectId}`,
    memberData
  );

  return response.data;
};

export const updateMemberRole = async (
  projectId,
  userId,
  role
) => {
  const response = await api.put(
    `/team/${projectId}/${userId}`,
    { role }
  );

  return response.data;
};

export const removeProjectMember = async (
  projectId,
  userId
) => {
  const response = await api.delete(
    `/team/${projectId}/${userId}`
  );

  return response.data;
};