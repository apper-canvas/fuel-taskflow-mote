import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Set all projects
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    // Add a new project
    createProject: (state, action) => {
      state.projects.push(action.payload);
    },
    // Update an existing project
    updateProject: (state, action) => {
      const { id } = action.payload;
      const existingProjectIndex = state.projects.findIndex(project => project.id === id);
      if (existingProjectIndex !== -1) {
        state.projects[existingProjectIndex] = {
          ...state.projects[existingProjectIndex],
          ...action.payload
        };
      }
    },
    // Delete a project
    deleteProject: (state, action) => {
      const projectId = action.payload;
      state.projects = state.projects.filter(project => project.id !== projectId);
    },
    // Set loading status
    setLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    // Set success status
    setSuccess: (state) => {
      state.status = 'succeeded';
    },
    // Set error status
    setError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    }
  }
});

// Export actions
export const { 
  setProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  setLoading,
  setSuccess,
  setError
} = projectsSlice.actions;

// Export selectors
export const selectAllProjects = state => state.projects.projects;
export const selectProjectById = (state, projectId) => 
  state.projects.projects.find(project => project.id === projectId);
export const selectProjectsStatus = state => state.projects.status;
export const selectProjectsError = state => state.projects.error;

export default projectsSlice.reducer;