/**
 * Time Entry service for time tracking operations
 */

import { authService } from './authService';

const TABLE_NAME = 'time_entry';

// Get all fields for time entries
const TIME_ENTRY_FIELDS = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
  'ModifiedOn', 'ModifiedBy', 'startTime', 'endTime',
  'duration', 'description', 'taskId'
];

// Get only updatable fields for creating/updating time entries
const UPDATABLE_FIELDS = [
  'Name', 'Tags', 'Owner', 'startTime', 'endTime',
  'duration', 'description', 'taskId'
];

export const timeEntryService = {
  /**
   * Get all time entries, optionally filtered by taskId
   * @param {Object} filters Optional filters (e.g., { taskId: 123 })
   * @returns {Promise<Array>} Time entries list
   */
  getAllTimeEntries: async (filters = {}) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: TIME_ENTRY_FIELDS,
        orderBy: [{ fieldName: 'startTime', SortType: 'DESC' }]
      };
      
      // Apply filters if provided
      if (filters.taskId) {
        params.where = [{
          fieldName: 'taskId',
          operator: 'ExactMatch',
          values: [filters.taskId]
        }];
      }
      
      if (filters.startDate && filters.endDate) {
        if (!params.where) params.where = [];
        
        params.where.push({
          fieldName: 'startTime',
          operator: 'GreaterThanOrEqualTo',
          values: [filters.startDate]
        });
        
        params.where.push({
          fieldName: 'endTime',
          operator: 'LessThanOrEqualTo',
          values: [filters.endDate]
        });
      }
      
      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response || !response.data) {
        return [];
      }
      
      return response.data.map(entry => ({
        id: entry.Id,
        taskId: entry.taskId,
        startTime: new Date(entry.startTime),
        endTime: new Date(entry.endTime),
        duration: entry.duration,
        description: entry.description || '',
        createdAt: entry.CreatedOn,
        name: entry.Name
      }));
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  },
  
  /**
   * Get a time entry by ID
   * @param {number} entryId Time entry ID
   * @returns {Promise<Object>} Time entry details
   */
  getTimeEntryById: async (entryId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: TIME_ENTRY_FIELDS
      };
      
      const response = await apperClient.getRecordById(TABLE_NAME, entryId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      const entry = response.data;
      return {
        id: entry.Id,
        taskId: entry.taskId,
        startTime: new Date(entry.startTime),
        endTime: new Date(entry.endTime),
        duration: entry.duration,
        description: entry.description || '',
        createdAt: entry.CreatedOn,
        name: entry.Name
      };
    } catch (error) {
      console.error(`Error fetching time entry ${entryId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new time entry
   * @param {Object} entryData Time entry data
   * @returns {Promise<Object>} Created time entry
   */
  createTimeEntry: async (entryData) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Name: entryData.description || `Time entry for task ${entryData.taskId}`,
          startTime: entryData.startTime.toISOString(),
          endTime: entryData.endTime.toISOString(),
          duration: entryData.duration,
          description: entryData.description || '',
          taskId: entryData.taskId,
          Tags: entryData.tags ? entryData.tags.join(',') : ''
        }]
      };
      
      const response = await apperClient.createRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  },
  
  /**
   * Delete a time entry
   * @param {number} entryId Time entry ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteTimeEntry: async (entryId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        RecordIds: [entryId]
      };
      
      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  }
};