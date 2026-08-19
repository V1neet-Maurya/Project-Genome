import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",

  initialState,

  reducers: {
    setNotifications: (state, action) => {
      state.notifications =
        action.payload.notifications || [];

      state.unreadCount =
        action.payload.unreadCount || 0;
    },

    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    addNotification: (state, action) => {
      state.notifications.unshift(
        action.payload
      );

      state.unreadCount += 1;
    },

    markRead: (state, action) => {
      const notification =
        state.notifications.find(
          (item) =>
            item._id === action.payload
        );

      if (notification && !notification.read) {
        notification.read = true;

        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      }
    },

    markAllRead: (state) => {
      state.notifications.forEach(
        (notification) => {
          notification.read = true;
        }
      );

      state.unreadCount = 0;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
});

export const {
  setNotifications,
  setUnreadCount,
  addNotification,
  markRead,
  markAllRead,
  setLoading,
  setError,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;