/**
 * Time Entry service for time entry CRUD operations
 */

import { authService } from './authService';
import { format, isWithinInterval, parseISO } from 'date-fns';

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
   * Get all time entries for a task
   * @param {number} taskId Task ID
   * @returns {Promise<Array>} Time entries list
   */
  getTimeEntriesByTask: async (taskId) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        fields: TIME_ENTRY_FIELDS,
        orderBy: [{ fieldName: 'startTime', SortType: 'DESC' }],
        where: [{
          fieldName: 'taskId',
          operator: 'ExactMatch',
          values: [taskId]
        }]
      };
      
      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response || !response.data) {
        return [];
      }
      
      return response.data.map(entry => ({
        id: entry.Id,
        taskId: entry.taskId,
        startTime: entry.startTime,
        endTime: entry.endTime,
        duration: entry.duration,
        description: entry.description || ''
      }));
    } catch (error) {
      console.error(`Error fetching time entries for task ${taskId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get time entries based on filters
   * @param {Object} filters Filter criteria (startDate, endDate, project, user)
   * @returns {Promise<Array>} Filtered time entries
   */
  getFilteredTimeEntries: async (filters) => {
    try {
      const { startDate, endDate, project, user } = filters;
      const apperClient = authService.getApperClient();
      
      // First, get tasks based on project/user filters
      const taskParams = {
        fields: ['Id', 'title', 'project', 'assignee', 'status']
      };
      
      if (project && project !== 'All Projects') {
        taskParams.where = [
          {
            fieldName: 'project',
            operator: 'ExactMatch',
            values: [project]
          }
        ];
      }
      
      if (user && user !== 'All Users') {
        if (!taskParams.where) taskParams.where = [];
        taskParams.where.push({
          fieldName: 'assignee',
          operator: 'ExactMatch',
          values: [user]
        });
      }
      
      const tasksResponse = await apperClient.fetchRecords('task1', taskParams);
      if (!tasksResponse || !tasksResponse.data || tasksResponse.data.length === 0) {
        return [];
      }
      
      const taskIds = tasksResponse.data.map(task => task.Id);
      
      // Get time entries for these tasks within date range
      const timeParams = {
        fields: TIME_ENTRY_FIELDS,
        where: [
          {
            fieldName: 'taskId',
            operator: 'ExactMatch',
            values: taskIds
          },
          {
            fieldName: 'startTime',
            operator: 'GreaterThanOrEqualTo',
            values: [new Date(startDate).toISOString()]
          },
          {
            fieldName: 'endTime',
            operator: 'LessThanOrEqualTo',
            values: [new Date(endDate).toISOString()]
          }
        ]
      };
      
      const timeResponse = await apperClient.fetchRecords(TABLE_NAME, timeParams);
      if (!timeResponse || !timeResponse.data) {
        return [];
      }
      
      // Join with task information
      const taskMap = {};
      tasksResponse.data.forEach(task => {
        taskMap[task.Id] = {
          id: task.Id,
          title: task.title,
          project: task.project,
          assignee: task.assignee,
          status: task.status
        };
      });
      
      return timeResponse.data.map(entry => {
        const task = taskMap[entry.taskId] || { title: 'Unknown Task' };
        return {
          id: entry.Id,
          taskId: entry.taskId,
          taskTitle: task.title,
          project: task.project,
          assignee: task.assignee,
          status: task.status,
          startTime: entry.startTime,
          endTime: entry.endTime,
          duration: entry.duration,
          description: entry.description || ''
        };
      });
    } catch (error) {
      console.error('Error filtering time entries:', error);
      throw error;
    }
  },
  
  /**
   * Add a time entry to a task
   * @param {number} taskId Task ID
   * @param {Object} timeEntry Time entry data
   * @returns {Promise<Object>} Created time entry
   */
  addTimeEntry: async (taskId, timeEntry) => {
    try {
      const apperClient = authService.getApperClient();
      const params = {
        records: [{
          Name: `Time entry for task ${taskId}`,
          taskId: taskId,
          startTime: new Date(timeEntry.startTime).toISOString(),
          endTime: new Date(timeEntry.endTime).toISOString(),
          duration: timeEntry.duration,
          description: timeEntry.description || ''
        }]
      };
      
      const response = await apperClient.createRecord(TABLE_NAME, params);
      return response;
    } catch (error) {
      console.error('Error adding time entry:', error);
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
  },
  
  /**
   * Calculate total time spent from entries
   * @param {Array} entries Time entries
   * @returns {Number} Total seconds
   */
  calculateTotalTime: (entries) => {
    return entries.reduce((total, entry) => total + entry.duration, 0);
  }
};