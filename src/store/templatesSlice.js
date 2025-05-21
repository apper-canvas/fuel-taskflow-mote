import { createSlice } from '@reduxjs/toolkit';
import { format } from 'date-fns';

// Sample initial templates
const initialTemplates = [
  {
    id: 1,
    title: 'Weekly Team Meeting',
    description: 'Recurring team sync meeting with progress updates and planning',
    dueDate: '', // Dynamic due date will be set when applied
    priority: 'Medium',
    status: 'To Do',
    tags: ['Meeting', 'Team', 'Planning'],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Bug Fix Template',
    description: 'Template for addressing and documenting software bugs',
    dueDate: '', // Dynamic due date will be set when applied
    priority: 'High',
    status: 'To Do',
    tags: ['Bug', 'Development', 'QA'],
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Content Creation',
    description: 'Standard workflow for creating blog posts and social content',
    dueDate: '', // Dynamic due date will be set when applied
    priority: 'Medium',
    status: 'To Do',
    tags: ['Content', 'Marketing'],
    createdAt: new Date().toISOString()
  }
];

const templatesSlice = createSlice({
  name: 'templates',
  initialState: initialTemplates,
  reducers: {
    // Create a new template
    createTemplate: (state, action) => {
      const newTemplate = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      state.push(newTemplate);
    },
    
    // Update an existing template
    updateTemplate: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const templateIndex = state.findIndex(template => template.id === id);
      
      if (templateIndex !== -1) {
        state[templateIndex] = { 
          ...state[templateIndex], 
          ...updatedFields,
          updatedAt: new Date().toISOString() 
        };
      }
    },
    
    // Delete a template
    deleteTemplate: (state, action) => {
      const templateId = action.payload;
      return state.filter(template => template.id !== templateId);
    }
  }
});

// Export actions
export const { 
  createTemplate, 
  updateTemplate, 
  deleteTemplate 
} = templatesSlice.actions;

// Selectors
export const selectAllTemplates = state => state.templates;
export const selectTemplateById = (state, templateId) => 
  state.templates.find(template => template.id === templateId);

// Export reducer
export default templatesSlice.reducer;