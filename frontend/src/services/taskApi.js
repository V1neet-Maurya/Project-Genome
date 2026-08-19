import api from "./api";

// =====================================================
// CREATE TASK
// =====================================================

export const createTask = async (taskData) => {
  const response = await api.post(
    "/tasks",
    taskData
  );

  return response.data;
};

// =====================================================
// GET ALL TASKS
// =====================================================

export const getTasks = async (params = {}) => {
  const response = await api.get(
    "/tasks",
    {
      params,
    }
  );

  return response.data;
};

// =====================================================
// GET SINGLE TASK
// =====================================================

export const getTask = async (id) => {
  const response = await api.get(
    `/tasks/${id}`
  );

  return response.data;
};

// =====================================================
// UPDATE TASK
// =====================================================

export const updateTask = async (
  id,
  taskData
) => {
  const response = await api.put(
    `/tasks/${id}`,
    taskData
  );

  return response.data;
};

// =====================================================
// DELETE TASK
// =====================================================

export const deleteTask = async (id) => {
  const response = await api.delete(
    `/tasks/${id}`
  );

  return response.data;
};