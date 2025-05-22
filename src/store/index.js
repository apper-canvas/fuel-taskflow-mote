import { configureStore, createSlice } from '@reduxjs/toolkit';
import templatesReducer from './templatesSlice';
import userReducer from './userSlice';
import projectsReducer from './projectsSlice';

// Timer slice for time tracking
const timerSlice = createSlice({
  name: 'timer',
  initialState: {
    activeTimer: null,
    loading: false,
    error: null
  },
  reducers: {
    // Start a new timer
    startTimer: (state, action) => {
      state.activeTimer = {
        taskId: action.payload.taskId,
        startTime: new Date().toISOString(),
        isRunning: true
      };
    },
    // Pause the active timer
    pauseTimer: (state) => {
      if (state.activeTimer && state.activeTimer.isRunning) {
        state.activeTimer.isRunning = false;
        state.activeTimer.pausedAt = new Date().toISOString();
      }
    },
    // Resume a paused timer
    resumeTimer: (state) => {
      if (state.activeTimer && !state.activeTimer.isRunning) {
        // Calculate the time that has passed since pause
        const pauseDuration = new Date() - new Date(state.activeTimer.pausedAt);
        delete state.activeTimer.pausedAt;
        state.activeTimer.isRunning = true;
      }
    },
    // Stop the active timer
    stopTimer: (state, action) => {
      if (state.activeTimer) {
        // Do not add to history here, as we'll handle the time entry in the component
        state.activeTimer = null;
      }
    }
  }
});



// Export timer actions
export const { startTimer, pauseTimer, resumeTimer, stopTimer } = timerSlice.actions;

// Export project actions and selectors from projectsSlice
export {
  createProject,
  updateProject,
  deleteProject,
  setProjects,
  selectAllProjects,
  selectProjectById
} from './projectsSlice';

// Selectors
export const selectActiveTimer = state => state.timer.activeTimer;

const store = configureStore({
  reducer: {
    templates: templatesReducer,
    timer: timerSlice.reducer,
    user: userReducer,
    projects: projectsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for Date objects
    })
});

export default store;