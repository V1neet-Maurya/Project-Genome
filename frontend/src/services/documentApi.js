import api from "./api";

export const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const uploadDocument = async (
  file,
  projectId
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("project", projectId);

  const response = await api.post(
    "/documents",
    formData
  );

  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(
    `/documents/${id}`
  );

  return response.data;
};