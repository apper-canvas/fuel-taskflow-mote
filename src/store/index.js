import { configureStore, createSlice } from '@reduxjs/toolkit';
import templatesReducer from './templatesSlice';

// Timer slice for time tracking
const timerSlice = createSlice({
  name: 'timer',
  initialState: {
    activeTimer: null,
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

// Tasks slice for task management
const tasksSlice = createSlice({
  name: 'tasks',
  initialState: [
    {
      id: 1,
      title: 'Design new dashboard layout',
      description: 'Create wireframes and mockups for the new analytics dashboard',
      dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      priority: 'High',
      status: 'In Progress',
      tags: ['Design', 'UI/UX'],
      timeEntries: []
    },
    {
      id: 2,
      title: 'Fix search functionality',
      description: 'Debug and resolve issues with the search feature in the app',
      dueDate: new Date(Date.now() + 86400000), // 1 day from now
      priority: 'Urgent',
      status: 'To Do',
      tags: ['Bug', 'Frontend'],
      timeEntries: []
    },
    {
      id: 3,
      title: 'Weekly team meeting',
      description: 'Prepare agenda for the weekly team sync meeting',
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      priority: 'Medium',
      status: 'To Do',
      tags: ['Meeting', 'Planning'],
      timeEntries: []
    }
  ],
  reducers: {
    // Create a new task
    createTask: (state, action) => {
      const newTask = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        timeEntries: []
      };
      state.push(newTask);
    },
    
    // Update an existing task
    updateTask: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const taskIndex = state.findIndex(task => task.id === id);
      
      if (taskIndex !== -1) {
        state[taskIndex] = { 
          ...state[taskIndex], 
          ...updatedFields,
          updatedAt: new Date().toISOString() 
        };
      }
    },
    
    // Delete a task
    deleteTask: (state, action) => {
      const taskId = action.payload;
      return state.filter(task => task.id !== taskId);
    },
    // Change task status
    changeTaskStatus: (state, action) => {
      const { taskId, newStatus } = action.payload;
      const taskIndex = state.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        state[taskIndex].status = newStatus;
      }
    },
    
    // Add time entry to a task
    addTimeEntry: (state, action) => {
      const { taskId, timeEntry } = action.payload;
      const taskIndex = state.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        if (!state[taskIndex].timeEntries) {
          state[taskIndex].timeEntries = [];
        }
        state[taskIndex].timeEntries.push(timeEntry);
      }
    },
    
    // Delete time entry from a task
    deleteTimeEntry: (state, action) => {
      const { taskId, entryId } = action.payload;
      const taskIndex = state.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1 && state[taskIndex].timeEntries) {
        state[taskIndex].timeEntries = state[taskIndex].timeEntries.filter(
          entry => entry.id !== entryId
        );
      }
    }
  }
      

// Export timer actions
export const { startTimer, pauseTimer, resumeTimer, stopTimer } = timerSlice.actions;

// Export tasks actions
  createTask, 
  updateTask, 
  deleteTask,
  changeTaskStatus,
  addTimeEntry,
  deleteTimeEntry
} = tasksSlice.actions;
        state.activeTimer.isRunning = false;

export const selectAllTasks = state => state.tasks;
export const selectTaskById = (state, taskId) => 
  state.tasks.find(task => task.id === taskId);
export const selectActiveTimer = state => state.timer.activeTimer;
    },

const store = configureStore({
  reducer: {
    tasks: tasksSlice.reducer,
    templates: templatesReducer,
    timer: timerSlice.reducer
  }
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for Date objects
    })

export default store;
      if (state.activeTimer && !state.activeTimer.isRunning) {