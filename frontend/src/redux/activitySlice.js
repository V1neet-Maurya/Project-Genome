import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activities: [],
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: "activity",

  initialState,

  reducers: {
    setActivities: (
      state,
      action
    ) => {
      state.activities =
        action.payload;
    },

    setLoading: (
      state,
      action
    ) => {
      state.loading =
        action.payload;
    },

    setError: (
      state,
      action
    ) => {
      state.error =
        action.payload;
    },

    clearActivities: (state) => {
      state.activities = [];
      state.error = null;
    },
  },
});

export const {
  setActivities,
  setLoading,
  setError,
  clearActivities,
} =
  activitySlice.actions;

export default activitySlice.reducer;