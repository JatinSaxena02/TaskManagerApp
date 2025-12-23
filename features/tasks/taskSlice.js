import { createSlice } from '@reduxjs/toolkit';
import { fetchTasks, addTask, updateTask, deleteTask } from './taskThunks';

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addTask.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t.id !== action.payload);
      });
  },
});

export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
