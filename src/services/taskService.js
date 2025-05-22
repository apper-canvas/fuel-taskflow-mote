/**
 * Task service for task CRUD operations
 */

import { authService } from './authService';

const TABLE_NAME = 'task1';

// Get all fields for tasks
const TASK_FIELDS = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
  'ModifiedOn', 'ModifiedBy', 'title', 'description',
  'dueDate', 'priority', 'status', 'assignee', 'projectId'
];

// Get only updatable fields for creating/updating tasks
const UPDATABLE_FIELDS = [
  'Name', 'Tags', 'Owner', 'title', 'description',
  'dueDate', 'priority', 'status', 'assignee', 'projectId'
];

export const taskService = {
  /**
   * Get all tasks, optionally filtered
   * @param {Object} filters Optional filters to apply
   * @returns {Promise<Array>} Tasks list
   */
  getAllTasks: async (filters = {}) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: TASK_FIELDS,
        orderBy: [{ fieldName: 'dueDate', SortType: 'ASC' }]
      };
      
      // Apply filters if provided
      if (Object.keys(filters).length > 0) {
        params.where = [];
        
        if (filters.status && filters.status !== 'All') {
          params.where.push({
            fieldName: 'status',
            operator: 'ExactMatch',
            values: [filters.status]
          });
        }
        
        if (filters.projectId) {
          params.where.push({
            fieldName: 'projectId',
            operator: 'ExactMatch',
            values: [filters.projectId]
          });
        }

        if (filters.project && filters.project !== 'All Projects') {
          params.where.push({
            fieldName: 'projectId',
            operator: 'ExactMatch',
            values: [filters.project]
          });
        }
      }
      
      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response || !response.data) {
        return [];
      }
      
      return response.data.map(task => ({
        id: task.Id,
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        priority: task.priority || 'Medium',
        status: task.status || 'Todo',
        tags: task.Tags ? task.Tags.split(',') : [],
        assignee: task.assignee || '',
        projectId: task.projectId || null,
        project: task.Name || '',
        createdAt: task.CreatedOn,
        timeEntries: [] // Time entries will be fetched separately or joined
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  
  /**
   * Get a task by ID
   * @param {number} taskId Task ID
   * @returns {Promise<Object>} Task details
   */
  getTaskById: async (taskId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: TASK_FIELDS
      };
      
      const response = await apperClient.getRecordById(TABLE_NAME, taskId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      const task = response.data;
      return {
        id: task.Id,
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        priority: task.priority || 'Medium',
        status: task.status || 'Todo',
        tags: task.Tags ? task.Tags.split(',') : [],
        assignee: task.assignee || '',
        projectId: task.projectId || null,
        project: task.Name || '',
        createdAt: task.CreatedOn,
        timeEntries: [] // Time entries will be fetched separately or joined
      };
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new task
   * @param {Object} taskData Task data
   * @returns {Promise<Object>} Created task
   */
  createTask: async (taskData) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Name: taskData.title, // Using title as the Name field
          title: taskData.title,
          description: taskData.description || '',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : null,
          priority: taskData.priority || 'Medium',
          status: taskData.status || 'Todo',
          Tags: taskData.tags ? taskData.tags.join(',') : '',
          assignee: taskData.assignee || '',
          projectId: taskData.projectId || null
        }]
      };
      
      const response = await apperClient.createRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  
  /**
   * Update a task
   * @param {Object} taskData Task data with ID
   * @returns {Promise<Object>} Updated task
   */
  updateTask: async (taskData) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Id: taskData.id,
          Name: taskData.title, // Using title as the Name field
          title: taskData.title,
          description: taskData.description || '',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : null,
          priority: taskData.priority || 'Medium',
          status: taskData.status || 'Todo',
          Tags: taskData.tags ? taskData.tags.join(',') : '',
          assignee: taskData.assignee || '',
          projectId: taskData.projectId || null
        }]
      };
      
      const response = await apperClient.updateRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  /**
   * Update a task's status
   * @param {number} taskId Task ID
   * @param {string} newStatus New status value
   * @returns {Promise<Object>} Update result
   */
  changeTaskStatus: async (taskId, newStatus) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Id: taskId,
          status: newStatus
        }]
      };
      
      const response = await apperClient.updateRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },
  
  /**
   * Delete a task
   * @param {number} taskId Task ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteTask: async (taskId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        RecordIds: [taskId]
      };
      
      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};