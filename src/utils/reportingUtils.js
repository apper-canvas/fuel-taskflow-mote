import { format, isWithinInterval, parseISO } from 'date-fns';
import { formatDuration } from './timeUtils';

/**
 * Filter time entries based on date range, project, and user
 * @param {Array} tasks - Tasks with time entries
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered and flattened time entries
 */
export const filterTimeEntries = (tasks, filters) => {
  const { startDate, endDate, project, user } = filters;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  end.setHours(23, 59, 59, 999); // Include the full end day
  
  return tasks
    .filter(task => {
      // Filter by project if needed
      if (project !== 'All Projects' && task.project !== project) {
        return false;
      }
      
      // Filter by user if needed
      if (user !== 'All Users' && task.assignee !== user) {
        return false;
      }
      
      return true;
    })
    .flatMap(task => {
      return (task.timeEntries || [])
        .filter(entry => {
          const entryDate = new Date(entry.startTime);
          return isWithinInterval(entryDate, { start, end });
        })
        .map(entry => ({
          ...entry,
          taskId: task.id,
          taskTitle: task.title,
          project: task.project,
          assignee: task.assignee,
          status: task.status
        }));
    });
};

/**
 * Calculate total time spent from entries
 * @param {Array} entries - Time entries
 * @returns {Number} Total seconds
 */
export const calculateTotalTime = (entries) => {
  return entries.reduce((total, entry) => total + entry.duration, 0);
};

/**
 * Aggregate time entries by dimension (project, user, task)
 * @param {Array} entries - Time entries
 * @param {String} dimension - Dimension to aggregate by
 * @returns {Object} Aggregated data
 */
export const aggregateTimeBy = (entries, dimension) => {
  const aggregatedData = {};
  
  entries.forEach(entry => {
    let key;
    switch (dimension) {
      case 'project':
        key = entry.project;
        break;
      case 'user':
        key = entry.assignee;
        break;
      case 'task':
        key = entry.taskTitle;
        break;
      case 'status':
        key = entry.status;
        break;
      case 'date':
        key = format(new Date(entry.startTime), 'yyyy-MM-dd');
        break;
      default:
        key = entry.project;
    }
    
    if (!aggregatedData[key]) {
      aggregatedData[key] = 0;
    }
    aggregatedData[key] += entry.duration;
  });
  
  return aggregatedData;
};

/**
 * Prepare data for CSV export
 * @param {Array} entries - Time entries
 * @returns {Array} Formatted data for CSV
 */
export const prepareCSVData = (entries) => {
  return entries.map(entry => ({
    'Date': format(new Date(entry.startTime), 'yyyy-MM-dd'),
    'Start Time': format(new Date(entry.startTime), 'HH:mm'),
    'End Time': format(new Date(entry.endTime), 'HH:mm'),
    'Duration': formatDuration(entry.duration),
    'Duration (hours)': (entry.duration / 3600).toFixed(2),
    'Task': entry.taskTitle,
    'Project': entry.project,
    'Assignee': entry.assignee,
    'Status': entry.status,
    'Description': entry.description || ''
  }));
};

export default { filterTimeEntries, calculateTotalTime, aggregateTimeBy, prepareCSVData };