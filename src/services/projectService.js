/**
 * Project Service
 * Handles all operations related to projects
 */

// Fetch all projects with optional filtering
export const fetchProjects = async (filters = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Define the table name based on the provided JSON
    const tableName = 'project';
    
    // Set up query parameters
    const params = {
      fields: ['Name', 'description', 'color', 'Tags', 'CreatedOn', 'ModifiedOn'],
      orderBy: [{ fieldName: 'ModifiedOn', SortType: 'DESC' }]
    };

    // Add filters if provided
    if (filters.where) {
      params.where = filters.where;
    }

    const response = await apperClient.fetchRecords(tableName, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Fetch all projects (convenience alias for fetchProjects with no filters)
export const getAllProjects = async () => {
  try {
    // Just call fetchProjects with no filters
    return await fetchProjects();
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    throw error;
  }
};

// Get a single project by ID
export const getProjectById = async (projectId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const tableName = 'project';
    const params = {
      fields: ['Name', 'description', 'color', 'Tags', 'CreatedOn', 'ModifiedOn']
    };

    const response = await apperClient.getRecordById(tableName, projectId, params);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project with ID ${projectId}:`, error);
    throw error;
  }
};

// Create a new project
export const createProject = async (projectData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const tableName = 'project';
    
    // Only include fields with visibility "Updateable"
    const params = {
      records: [{
        Name: projectData.name,
        description: projectData.description,
        color: projectData.color || '#4F46E5',
        Tags: projectData.tags || ''
      }]
    };

    const response = await apperClient.createRecord(tableName, params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      const createdProject = response.results[0].data;
      return createdProject;
    } else {
      throw new Error("Failed to create project");
    }
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

// Create a named export object for compatibility with existing imports
export const projectService = {
  fetchProjects, getAllProjects, getProjectById, createProject
};

export default { fetchProjects, getAllProjects, getProjectById, createProject };