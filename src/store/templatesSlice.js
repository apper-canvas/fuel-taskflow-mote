import { createSlice } from '@reduxjs/toolkit';
import { format } from 'date-fns';

// Initial state for templates
const initialState = {
  templates: [],
  loading: false,
  error: null
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    // Create a new template
    setTemplates: (state, action) => {
      state.templates = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Set loading state
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Set error state
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

// Export actions
export const { 
  setTemplates,
  setLoading,
  setError
} = templatesSlice.actions;

// Selectors
export const selectAllTemplates = state => state.templates.templates;
export const selectTemplatesLoading = state => state.templates.loading;
export const selectTemplatesError = state => state.templates.error;

// Export reducer
export default templatesSlice.reducer;