/**
 * Project service for project CRUD operations
 */

import { authService } from './authService';

const TABLE_NAME = 'project';

// Get all fields for projects
const PROJECT_FIELDS = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
  'ModifiedOn', 'ModifiedBy', 'description', 'color'
];

// Get only updatable fields for creating/updating projects
const UPDATABLE_FIELDS = ['Name', 'Tags', 'Owner', 'description', 'color'];

export const projectService = {
  /**
   * Get all projects
   * @returns {Promise<Array>} Projects list
   */
  getAllProjects: async () => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: PROJECT_FIELDS,
        orderBy: [{ fieldName: 'Name', SortType: 'ASC' }]
      };
      
      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response || !response.data) {
        return [];
      }
      
      return response.data.map(project => ({
        id: project.Id,
        name: project.Name,
        description: project.description || '',
        color: project.color || '#4f46e5',
        tags: project.Tags ? project.Tags.split(',') : [],
        createdAt: project.CreatedOn,
        owner: project.Owner
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  /**
   * Get a project by ID
   * @param {number} projectId Project ID
   * @returns {Promise<Object>} Project details
   */
  getProjectById: async (projectId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: PROJECT_FIELDS
      };
      
      const response = await apperClient.getRecordById(TABLE_NAME, projectId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      const project = response.data;
      return {
        id: project.Id,
        name: project.Name,
        description: project.description || '',
        color: project.color || '#4f46e5',
        tags: project.Tags ? project.Tags.split(',') : [],
        createdAt: project.CreatedOn,
        owner: project.Owner
      };
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new project
   * @param {Object} projectData Project data
   * @returns {Promise<Object>} Created project
   */
  createProject: async (projectData) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Name: projectData.name,
          description: projectData.description || '',
          color: projectData.color || '#4f46e5',
          Tags: projectData.tags ? projectData.tags.join(',') : ''
        }]
      };
      
      const response = await apperClient.createRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  /**
   * Update a project
   * @param {Object} projectData Project data with ID
   * @returns {Promise<Object>} Updated project
   */
  updateProject: async (projectData) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Id: projectData.id,
          Name: projectData.name,
          description: projectData.description || '',
          color: projectData.color || '#4f46e5',
          Tags: projectData.tags ? projectData.tags.join(',') : ''
        }]
      };
      
      const response = await apperClient.updateRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },
  
  /**
   * Delete a project
   * @param {number} projectId Project ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteProject: async (projectId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        RecordIds: [projectId]
      };
      
      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};