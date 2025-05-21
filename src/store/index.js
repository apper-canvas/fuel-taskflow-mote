import { configureStore, createSlice } from '@reduxjs/toolkit';
import templatesReducer from './templatesSlice';

// Time tracking slice
const timerSlice = createSlice({
  name: 'timer',
  initialState: {
    activeTimer: null,
    history: []
  },
  reducers: {
    startTimer: (state, action) => {
      const { taskId } = action.payload;
      
      // If there's already an active timer, stop it first
      if (state.activeTimer) {
        // Save the current timer to history
        const { taskId: prevTaskId, startTime } = state.activeTimer;
        const endTime = new Date().toISOString();
        state.history.push({
          taskId: prevTaskId,
          startTime,
          endTime,
          duration: (new Date(endTime) - new Date(startTime)) / 1000
        });
      }
      
      // Start new timer
      state.activeTimer = {
        taskId,
        startTime: new Date().toISOString(),
        isRunning: true
      };
    },
    pauseTimer: (state) => {
      if (state.activeTimer && state.activeTimer.isRunning) {
        state.activeTimer.isRunning = false;
        state.activeTimer.pausedAt = new Date().toISOString();
      }
    },
    resumeTimer: (state) => {
      if (state.activeTimer && !state.activeTimer.isRunning) {
        // Calculate the time that has passed since pause
        const pauseDuration = new Date() - new Date(state.activeTimer.pausedAt);
    timer: timerSlice.reducer,
    templates: templatesReducer
        delete state.activeTimer.pausedAt;
      }
    },
    stopTimer: (state, action) => {
      if (state.activeTimer) {
        // Do not add to history here, as we'll handle the time entry in the component
        state.activeTimer = null;
      }
    }
  }
});

export const { startTimer, pauseTimer, resumeTimer, stopTimer } = timerSlice.actions;

// Configure the Redux store
export const store = configureStore({
  reducer: {
    timer: timerSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for Date objects
    })
});