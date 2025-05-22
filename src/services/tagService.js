/**
 * Tag service for tag CRUD operations
 */

import { authService } from './authService';

const TABLE_NAME = 'tag';
const TASK_TAG_TABLE = 'task_tag';
const TEMPLATE_TAG_TABLE = 'template_tag';

// Get all fields for tags
const TAG_FIELDS = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
  'ModifiedOn', 'ModifiedBy'
];

// Get only updatable fields for creating/updating tags
const UPDATABLE_FIELDS = ['Name', 'Tags', 'Owner'];

export const tagService = {
  /**
   * Get all tags
   * @returns {Promise<Array>} Tags list
   */
  getAllTags: async () => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: TAG_FIELDS,
        orderBy: [{ fieldName: 'Name', SortType: 'ASC' }]
      };
      
      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response || !response.data) {
        return [];
      }
      
      return response.data.map(tag => ({
        id: tag.Id,
        name: tag.Name,
        createdAt: tag.CreatedOn
      }));
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },
  
  /**
   * Create a new tag
   * @param {Object} tagData Tag data
   * @returns {Promise<Object>} Created tag
   */
  createTag: async (tagData) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Name: tagData.name
        }]
      };
      
      const response = await apperClient.createRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  },
  
  /**
   * Associate a tag with a task
   * @param {number} taskId Task ID
   * @param {number} tagId Tag ID
   * @returns {Promise<Object>} Association result
   */
  associateTagWithTask: async (taskId, tagId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Name: `Task ${taskId} - Tag ${tagId}`,
          taskId: taskId,
          tagId: tagId
        }]
      };
      
      const response = await apperClient.createRecord(TASK_TAG_TABLE, params);
      return response;
    } catch (error) {
      console.error('Error associating tag with task:', error);
      throw error;
    }
  },
  
  /**
   * Associate a tag with a template
   * @param {number} templateId Template ID
   * @param {number} tagId Tag ID
   * @returns {Promise<Object>} Association result
   */
  associateTagWithTemplate: async (templateId, tagId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Name: `Template ${templateId} - Tag ${tagId}`,
          templateId: templateId,
          tagId: tagId
        }]
      };
      
      const response = await apperClient.createRecord(TEMPLATE_TAG_TABLE, params);
      return response;
    } catch (error) {
      console.error('Error associating tag with template:', error);
      throw error;
    }
  },
  
  /**
   * Get tags for a task
   * @param {number} taskId Task ID
   * @returns {Promise<Array>} Tags list
   */
  getTagsForTask: async (taskId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: ['tagId'],
        where: [{
          fieldName: 'taskId',
          operator: 'ExactMatch',
          values: [taskId]
        }]
      };
      
      const response = await apperClient.fetchRecords(TASK_TAG_TABLE, params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      const tagIds = response.data.map(relation => relation.tagId);
      
      // Fetch the actual tags
      const tagParams = {
        fields: TAG_FIELDS,
        where: [{
          fieldName: 'Id',
          operator: 'ExactMatch',
          values: tagIds
        }]
      };
      
      const tagsResponse = await apperClient.fetchRecords(TABLE_NAME, tagParams);
      
      if (!tagsResponse || !tagsResponse.data) {
        return [];
      }
      
      return tagsResponse.data.map(tag => ({
        id: tag.Id,
        name: tag.Name
      }));
    } catch (error) {
      console.error(`Error fetching tags for task ${taskId}:`, error);
      throw error;
    }
  }
};