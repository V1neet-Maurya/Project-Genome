import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "projects",

  initialState,

  reducers: {
    setProjects: (state, action) => {
      state.projects = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },

    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },

    updateProject: (state, action) => {
      const index = state.projects.findIndex(
        (project) =>
          project._id === action.payload._id
      );

      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },

    removeProject: (state, action) => {
      state.projects = state.projects.filter(
        (project) =>
          project._id !== action.payload
      );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProjects,
  addProject,
  setCurrentProject,
  updateProject,
  removeProject,
  setLoading,
  setError,
} = projectSlice.actions;

export default projectSlice.reducer;