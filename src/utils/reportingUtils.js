import { format, isWithinInterval, parseISO } from 'date-fns';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

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
        tags: task.tags 
          ? task.tags.join(', ') 
          : '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate 
          ? new Date(task.dueDate).toLocaleDateString() : '',
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
    'Tags',
    'Priority',
    'Status',

/**
 * Aggregate time entries by dimension (project, user, task)
 * @param {Array} entries - Time entries
 * @param {String} dimension - Dimension to aggregate by
 * @returns {Object} Aggregated data
 */
export const aggregateTimeBy = (entries, dimension) => {
  const aggregatedData = {};
  // If grouped by priority
  if (filters.groupBy === 'priority') {
    const priorityData = {};
    
    filteredTasks.forEach(task => {
      const priority = task.priority || 'Unspecified';
      if (!priorityData[priority]) {
        priorityData[priority] = {
          name: priority,
          totalTime: 0,
          totalTasks: 0,
          completed: 0,
          overdue: 0,
          items: []
        };
      }
      
      const totalTime = getTotalTimeForTask(task.timeEntries);
      
      priorityData[priority].totalTime += totalTime;
      priorityData[priority].totalTasks += 1;
      priorityData[priority].completed += task.status === 'Completed' ? 1 : 0;
      priorityData[priority].overdue += new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 1 : 0;
      priorityData[priority].items.push({ ...task, totalTime });
    });
    
    return priorityData;
  }
  
  
  
  entries.forEach(entry => {
    let key;
    if (!entry) {
      return; // Skip undefined entries
    }
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
      case 'projectId':
        key = entry.projectId ? entry.projectId.toString() : 'No Project';
        break;
      default:
        key = entry.project;
    }
    
    // Default key if undefined
    key = key || 'Unspecified';
    
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
    'Duration (h)': (entry.duration / 3600).toFixed(2),
    'Task': entry.taskTitle,
    'Project': entry.project,
    'Assignee': entry.assignee,
    'Status': entry.status,
    'Description': entry.description || ''
  }));
};

/**
 * Export data to CSV file
 * @param {Array} entries - Time entries
 * @param {String} filename - Name of the file to download
 * @returns {void}
 */
export const exportToCSV = (entries, filename = 'time-report.csv') => {
  const csvData = prepareCSVData(entries);
  
  // Handle empty data case
  if (csvData.length === 0) {
    csvData.push({
      'Date': '', 'Start Time': '', 'End Time': '', 'Duration (h)': '',
      'Task': '', 'Project': '', 'Assignee': '', 'Status': '',
      'Description': 'No data found for the selected filters'
    });
  }
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
};
};

// Helper function to sort tasks by priority
export const sortTasksByPriority = (tasks) => {
  const priorityOrder = {
    'Urgent': 0,
    'High': 1,
    'Medium': 2,
    'Low': 3,
    'Unspecified': 4
  };
  
  return [...tasks].sort((a, b) => 
    priorityOrder[a.priority || 'Unspecified'] - priorityOrder[b.priority || 'Unspecified']);
};

export default { filterTimeEntries, calculateTotalTime, aggregateTimeBy, prepareCSVData, exportToCSV };