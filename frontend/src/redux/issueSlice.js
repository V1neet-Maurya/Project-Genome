import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  issues: [],
  currentIssue: null,
  loading: false,
  error: null,
};

const issueSlice = createSlice({
  name: "issue",

  initialState,

  reducers: {
    setIssues: (state, action) => {
      state.issues = action.payload;
    },

    addIssue: (state, action) => {
      state.issues.unshift(action.payload);
    },

    updateIssueInStore: (state, action) => {
      const index = state.issues.findIndex(
        (issue) =>
          issue._id === action.payload._id
      );

      if (index !== -1) {
        state.issues[index] = action.payload;
      }
    },

    removeIssue: (state, action) => {
      state.issues = state.issues.filter(
        (issue) =>
          issue._id !== action.payload
      );
    },

    setCurrentIssue: (state, action) => {
      state.currentIssue = action.payload;
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
  setIssues,
  addIssue,
  updateIssueInStore,
  removeIssue,
  setCurrentIssue,
  setLoading,
  setError,
} = issueSlice.actions;

export default issueSlice.reducer;