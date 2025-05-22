/**
 * Utility functions for reporting features
 */

import { format } from 'date-fns';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

/**
 * Export time entries to CSV file
 * @param {Array} entries The time entries to export
 * @param {string} fileName The name of the exported file
 */
export const exportToCSV = (entries, fileName) => {
  // Prepare data for CSV format
  const data = entries.map(entry => ({
    'Task': entry.taskTitle || 'Unknown Task',
    'Project': entry.project || 'No Project',
    'Start Time': format(new Date(entry.startTime), 'yyyy-MM-dd HH:mm:ss'),
    'End Time': format(new Date(entry.endTime), 'yyyy-MM-dd HH:mm:ss'),
    'Duration (hours)': (entry.duration / 3600).toFixed(2),
    'Description': entry.description || '',
    'User': entry.assignee || 'Unknown'
  }));
  
  // Convert to CSV string
  const csv = Papa.unparse(data);
  
  // Create Blob and save file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, fileName);
};

/**
 * Get all unique tags from tasks
 * @param {Array} tasks List of tasks
 * @returns {Array} List of unique tags
 */
export const getAllUniqueTags = (tasks) => {
  return [...new Set(tasks.flatMap(task => task.tags || []))].sort();
};