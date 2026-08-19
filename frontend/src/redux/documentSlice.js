import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  documents: [],
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: "document",

  initialState,

  reducers: {
    setDocuments: (state, action) => {
      state.documents = action.payload;
    },

    addDocument: (state, action) => {
      state.documents.unshift(
        action.payload
      );
    },

    removeDocument: (state, action) => {
      state.documents =
        state.documents.filter(
          (document) =>
            document._id !== action.payload
        );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearDocuments: (state) => {
      state.documents = [];
      state.error = null;
    },
  },
});

export const {
  setDocuments,
  addDocument,
  removeDocument,
  setLoading,
  setError,
  clearDocuments,
} = documentSlice.actions;

export default documentSlice.reducer;