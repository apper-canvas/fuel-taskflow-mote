/**
 * Template service for template CRUD operations
 */

import { authService } from './authService';

const TABLE_NAME = 'template';

// Get all fields for templates
const TEMPLATE_FIELDS = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
  'ModifiedOn', 'ModifiedBy', 'title', 'description',
  'project', 'priority', 'status'
];

// Get only updatable fields for creating/updating templates
const UPDATABLE_FIELDS = [
  'Name', 'Tags', 'Owner', 'title', 'description',
  'project', 'priority', 'status'
];

export const templateService = {
  /**
   * Get all templates
   * @returns {Promise<Array>} Templates list
   */
  getAllTemplates: async () => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: TEMPLATE_FIELDS,
        orderBy: [{ fieldName: 'CreatedOn', SortType: 'DESC' }]
      };
      
      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response || !response.data) {
        return [];
      }
      
      return response.data.map(template => ({
        id: template.Id,
        title: template.title || template.Name,
        description: template.description || '',
        project: template.project || '',
        priority: template.priority || 'Medium',
        status: template.status || 'Todo',
        tags: template.Tags ? template.Tags.split(',') : [],
        createdAt: template.CreatedOn
      }));
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },
  
  /**
   * Get a template by ID
   * @param {number} templateId Template ID
   * @returns {Promise<Object>} Template details
   */
  getTemplateById: async (templateId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: TEMPLATE_FIELDS
      };
      
      const response = await apperClient.getRecordById(TABLE_NAME, templateId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      const template = response.data;
      return {
        id: template.Id,
        title: template.title || template.Name,
        description: template.description || '',
        project: template.project || '',
        priority: template.priority || 'Medium',
        status: template.status || 'Todo',
        tags: template.Tags ? template.Tags.split(',') : [],
        createdAt: template.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching template ${templateId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new template
   * @param {Object} templateData Template data
   * @returns {Promise<Object>} Created template
   */
  createTemplate: async (templateData) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Name: templateData.title, // Using title as the Name field
          title: templateData.title,
          description: templateData.description || '',
          project: templateData.project || '',
          priority: templateData.priority || 'Medium',
          status: templateData.status || 'Todo',
          Tags: templateData.tags ? templateData.tags.join(',') : ''
        }]
      };
      
      const response = await apperClient.createRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },
  
  /**
   * Update a template
   * @param {Object} templateData Template data with ID
   * @returns {Promise<Object>} Updated template
   */
  updateTemplate: async (templateData) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Id: templateData.id,
          Name: templateData.title, // Using title as the Name field
          title: templateData.title,
          description: templateData.description || '',
          project: templateData.project || '',
          priority: templateData.priority || 'Medium',
          status: templateData.status || 'Todo',
          Tags: templateData.tags ? templateData.tags.join(',') : ''
        }]
      };
      
      const response = await apperClient.updateRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },
  
  /**
   * Delete a template
   * @param {number} templateId Template ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteTemplate: async (templateId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        RecordIds: [templateId]
      };
      
      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
};