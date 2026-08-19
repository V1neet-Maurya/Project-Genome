import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  members: [],
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: "team",

  initialState,

  reducers: {
    setMembers: (state, action) => {
      state.members = action.payload;
    },

    addMemberToStore: (state, action) => {
      state.members.push(action.payload);
    },

    updateMemberInStore: (state, action) => {
      const index = state.members.findIndex(
        (member) =>
          member.user?._id === action.payload.user?._id
      );

      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },

    removeMemberFromStore: (state, action) => {
      state.members = state.members.filter(
        (member) =>
          member.user?._id !== action.payload
      );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearTeam: (state) => {
      state.members = [];
      state.error = null;
    },
  },
});

export const {
  setMembers,
  addMemberToStore,
  updateMemberInStore,
  removeMemberFromStore,
  setLoading,
  setError,
  clearTeam,
} = teamSlice.actions;

export default teamSlice.reducer;