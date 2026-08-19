import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    setDashboard: (state, action) => {
      state.data = action.payload;
    },

    setDashboardLoading: (
      state,
      action
    ) => {
      state.loading = action.payload;
    },

    setDashboardError: (
      state,
      action
    ) => {
      state.error = action.payload;
    },

    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
    },
  },
});

export const {
  setDashboard,
  setDashboardLoading,
  setDashboardError,
  clearDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;