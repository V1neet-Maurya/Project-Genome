import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "task",

  initialState,

  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },

    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },

    updateTaskInStore: (state, action) => {
  const index = state.tasks.findIndex(
    (task) => task._id === action.payload._id
  );

  if (index !== -1) {
    state.tasks[index] = action.payload;
  }
},

    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(
        (task) => task._id !== action.payload
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
  setTasks,
  addTask,
  updateTaskInStore,
  removeTask,
  setLoading,
  setError,
} = taskSlice.actions;

export default taskSlice.reducer;