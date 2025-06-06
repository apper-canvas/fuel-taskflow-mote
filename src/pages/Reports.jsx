import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { formatDuration } from '../utils/timeUtils';
import ReactApexChart from 'react-apexcharts';
import { exportToCSV } from '../utils/reportingUtils';
import { timeEntryService } from '../services/timeEntryService';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { BarChart2, Filter, X, FileText, Users, TrendingUp, Calendar, Download } from 'lucide-react';

// State for data loading and filtering

// Time ranges for filtering
const TIME_RANGES = {
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  THIS_WEEK: 'This Week',
  LAST_WEEK: 'Last Week',
  THIS_MONTH: 'This Month',
  LAST_MONTH: 'Last Month',
  CUSTOM: 'Custom Range'
};

const Reports = () => {
  // State for loaded data
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  
  // State for filter options
  const [dateRange, setDateRange] = useState(TIME_RANGES.THIS_WEEK);
  const [startDate, setStartDate] = useState(() => format(startOfWeek(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(endOfWeek(new Date()), 'yyyy-MM-dd'));
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);

  const [filteredTag, setFilteredTag] = useState('All Tags');
  
  // Load data on component mount
  useEffect(() => {
    fetchData();
    fetchProjects();
  }, []);
  
  // Fetch data when filters change
  useEffect(() => {
    fetchTimeEntriesWithFilters();
  }, [startDate, endDate, selectedProject, selectedUser, filteredTag]);
  
  // Fetch tasks and users
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await taskService.getAllTasks();
      setTasks(fetchedTasks);
      
      // Extract unique users from tasks
      const users = [...new Set(fetchedTasks.map(task => task.assignee).filter(Boolean))];
      setUsersList(['All Users', ...users]);
      
      // Initial time entries load
      fetchTimeEntriesWithFilters();
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const fetchedProjects = await projectService.getAllProjects();
      setProjectsList(['All Projects', ...fetchedProjects.map(p => p.name)]);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };
  
  // Fetch time entries with filters
  const fetchTimeEntriesWithFilters = async () => {
    setLoading(true);
    try {
      // Convert dates to proper format
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      end.setHours(23, 59, 59, 999); // Include the full end day
      
      // Fetch all time entries in the date range
      const allTimeEntries = await timeEntryService.getAllTimeEntries({
        startDate: startDate,
        endDate: format(end, 'yyyy-MM-dd')
      });
      
      // Enrich time entries with task data
      const enrichedEntries = await Promise.all(
        allTimeEntries.map(async (entry) => {
          try {
            if (entry.taskId) {
              const task = tasks.find(t => t.id === entry.taskId) || 
                          await taskService.getTaskById(entry.taskId);
              
              return {
                ...entry,
                taskTitle: task?.title || 'Unknown Task',
                project: task?.project || 'No Project',
                assignee: task?.assignee || 'Unassigned',
                tags: task?.tags || []
              };
            }
            return entry;
          } catch (error) {
            console.error(`Error enriching time entry ${entry.id}:`, error);
            return {
              ...entry,
              taskTitle: 'Unknown Task',
              project: 'No Project',
              assignee: 'Unassigned',
              tags: []
            };
          }
        })
      );
      
      // Apply filters
      let filtered = enrichedEntries;
      
      if (selectedProject !== 'All Projects') {
        filtered = filtered.filter(entry => entry.project === selectedProject);
      }
      
      if (selectedUser !== 'All Users') {
        filtered = filtered.filter(entry => entry.assignee === selectedUser);
      }
      
      if (filteredTag !== 'All Tags') {
        filtered = filtered.filter(entry => entry.tags && entry.tags.includes(filteredTag));
      }
      
      setTimeEntries(filtered);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      setError('Failed to load time entries. Please try again.');
      toast.error('Failed to load time entry data');
    } finally {
      setLoading(false);
    }
  };

  // Update date range when the range type changes
  useEffect(() => {
    const now = new Date();
    
    switch(dateRange) {
      case TIME_RANGES.TODAY:
        setStartDate(format(now, 'yyyy-MM-dd'));
        setEndDate(format(now, 'yyyy-MM-dd'));
        break;
      case TIME_RANGES.YESTERDAY:
        const yesterday = subDays(now, 1);
        setStartDate(format(yesterday, 'yyyy-MM-dd'));
        setEndDate(format(yesterday, 'yyyy-MM-dd'));
        break;
      case TIME_RANGES.THIS_WEEK:
        setStartDate(format(startOfWeek(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(now), 'yyyy-MM-dd'));
        break;
      case TIME_RANGES.LAST_WEEK:
        const lastWeekStart = subDays(startOfWeek(now), 7);
        const lastWeekEnd = subDays(endOfWeek(now), 7);
        setStartDate(format(lastWeekStart, 'yyyy-MM-dd'));
        setEndDate(format(lastWeekEnd, 'yyyy-MM-dd'));
        break;
      case TIME_RANGES.THIS_MONTH:
        setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case TIME_RANGES.LAST_MONTH:
        const lastMonthStart = startOfMonth(subDays(startOfMonth(now), 1));
        const lastMonthEnd = endOfMonth(lastMonthStart);
        setStartDate(format(lastMonthStart, 'yyyy-MM-dd'));
        setEndDate(format(lastMonthEnd, 'yyyy-MM-dd'));
        break;
      case TIME_RANGES.CUSTOM:
        // Leave dates as they are for custom range
        break;
      default:
        setStartDate(format(startOfWeek(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(now), 'yyyy-MM-dd'));
    }
  }, [dateRange]);

  // Get all unique tags from tasks
  const getAllTags = () => {
    const allTags = new Set(tasks.flatMap(task => task.tags || []));
    return ['All Tags', ...Array.from(allTags)].sort();
  };
  
  // Calculate total time spent
  const getTotalTimeSpent = (entries) => {
    return entries.reduce((total, entry) => total + entry.duration, 0);
  };

  // Prepare data for time by project chart
  const getTimeByProjectData = () => {
    const filteredEntries = timeEntries;
    const projectData = {};
    
    filteredEntries.forEach(entry => {
      if (!projectData[entry.project]) {
        projectData[entry.project] = 0;
      }
      projectData[entry.project] += entry.duration;
    });
    
    return {
      categories: Object.keys(projectData),
      series: [{
        name: 'Time Spent',
        data: Object.values(projectData).map(seconds => Math.round(seconds / 3600 * 100) / 100) // Convert to hours with 2 decimal places
      }]
    };
  };

  // Prepare data for time by user chart
  const getTimeByUserData = () => {
    const filteredEntries = timeEntries;
    const userData = {};
    
    filteredEntries.forEach(entry => {
      if (!userData[entry.assignee]) {
        userData[entry.assignee] = 0;
      }
      userData[entry.assignee] += entry.duration;
    });
    
    return {
      categories: Object.keys(userData),
      series: [{
        name: 'Time Spent',
        data: Object.values(userData).map(seconds => Math.round(seconds / 3600 * 100) / 100) // Convert to hours with 2 decimal places
      }]
    };
  };

  // Prepare data for time by task chart
  const getTimeByTaskData = () => {
    const filteredEntries = timeEntries;
    const taskData = {};
    
    filteredEntries.forEach(entry => {
      const key = `${entry.taskTitle}`;
      if (!taskData[key]) {
        taskData[key] = 0;
      }
      taskData[key] += entry.duration;
    });
    
    // Sort by time spent and get top 10
    const sortedTasks = Object.entries(taskData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    return {
      categories: sortedTasks.map(item => item[0]),
      series: [{
        name: 'Time Spent',
        data: sortedTasks.map(item => Math.round(item[1] / 3600 * 100) / 100) // Convert to hours with 2 decimal places
      }]
    };
  };

  // Get day-by-day time distribution
  const getTimeDistributionData = () => {
    const filteredEntries = timeEntries;
    const timeByDay = {};
    
    // Initialize days in the range
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = [];
    let current = new Date(start);
    
    while (current <= end) {
      const dateStr = format(current, 'yyyy-MM-dd');
      days.push(dateStr);
      timeByDay[dateStr] = 0;
      current.setDate(current.getDate() + 1);
    }
    
    // Sum up time entries by day
    filteredEntries.forEach(entry => {
      const day = format(new Date(entry.startTime), 'yyyy-MM-dd');
      if (timeByDay[day] !== undefined) {
        timeByDay[day] += entry.duration;
      }
    });
    
    return {
      categories: days.map(day => format(parseISO(day), 'MMM dd')),
      series: [{
        name: 'Hours',
        data: days.map(day => Math.round(timeByDay[day] / 3600 * 100) / 100) // Convert to hours with 2 decimal places
      }]
    };
  };

  // Export data as CSV
  const exportCSV = () => {
    const filteredEntries = timeEntries;
    const fileName = `time-report-${startDate}-to-${endDate}.csv`;
    exportToCSV(filteredEntries, fileName);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 pt-16 sm:px-6 sm:py-12 sm:pt-20 lg:px-8">
        <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-4">
          {/* Loading indicator */}
          {loading && (
            <div className="text-primary flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading report data...</span>
            </div>
          )}
          {/* Error display */}
          {error && (
            <div className="text-red-500">{error}</div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Time Reports</h1>
            <p className="mt-1 text-surface-600 dark:text-surface-400">
              Analyze time spent on projects, tasks, and team members.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center"
            >
              {showFilters ? <X className="mr-1 h-4 w-4" /> : <Filter className="mr-1 h-4 w-4" />}
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={exportCSV}
              className="btn btn-primary flex items-center"
            >
              <Download className="mr-1 h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 rounded-lg border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="input w-full"
                >
                  {Object.values(TIME_RANGES).map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
              
              {dateRange === TIME_RANGES.CUSTOM && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="mb-1 block text-sm font-medium">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="input w-full"
                  disabled={loadingProjects}
                >
                  {projectsList.map((project) => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium">Team Member</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="input w-full"
                  disabled={loadingUsers}
                >
                  {usersList.map((user) => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium">Tag</label>
                <select
                  value={filteredTag}
                  onChange={(e) => setFilteredTag(e.target.value)}
                  className="input w-full"
                >
                  {getAllTags().map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Report navigation */}
        <div className="mb-6 flex border-b border-surface-200 dark:border-surface-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'overview' 
                ? 'border-primary text-primary' 
                : 'border-transparent hover:border-surface-300 hover:text-surface-600 dark:hover:border-surface-600 dark:hover:text-surface-300'
            }`}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'projects' 
                ? 'border-primary text-primary' 
                : 'border-transparent hover:border-surface-300 hover:text-surface-600 dark:hover:border-surface-600 dark:hover:text-surface-300'
            }`}
          >
            <FileText className="mr-2 h-4 w-4" />
            By Project
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'users' 
                ? 'border-primary text-primary' 
                : 'border-transparent hover:border-surface-300 hover:text-surface-600 dark:hover:border-surface-600 dark:hover:text-surface-300'
            }`}
          >
            <Users className="mr-2 h-4 w-4" />
            By Team Member
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'tasks' 
                ? 'border-primary text-primary' 
                : 'border-transparent hover:border-surface-300 hover:text-surface-600 dark:hover:border-surface-600 dark:hover:text-surface-300'
            }`}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            By Task
          </button>
        </div>
        
        {/* Summary cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
            <h3 className="mb-1 text-lg font-medium">Total Time</h3>
            <p className="text-2xl font-semibold text-primary">{formatDuration(getTotalTimeSpent(timeEntries))}</p>
          </div>
          <div className="rounded-lg border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
            <h3 className="mb-1 text-lg font-medium">Time Entries</h3>
            <p className="text-2xl font-semibold text-primary">{timeEntries.length}</p>
          </div>
          <div className="rounded-lg border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
            <h3 className="mb-1 text-lg font-medium">Date Range</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              <Calendar className="mr-1 inline-block h-4 w-4" />
              {format(parseISO(startDate), 'MMM d, yyyy')} - {format(parseISO(endDate), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        
        {/* Charts based on active tab */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              <div className="card">
                <h3 className="mb-4 text-lg font-medium">Daily Time Distribution</h3>
                <ReactApexChart 
                  type="area"
                  height={350}
                  options={{
                    chart: { toolbar: { show: false } },
                    stroke: { curve: 'smooth' },
                    xaxis: { categories: getTimeDistributionData().categories },
                    yaxis: { title: { text: 'Hours' } },
                    fill: { type: 'gradient', gradient: { shade: 'dark', gradientToColors: ['#6366f1'], shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
                    colors: ['#6366f1']
                  }}
                  series={getTimeDistributionData().series}
                />
              </div>
            </>
          )}
          
          {activeTab === 'projects' && (
            <>
              <div className="card">
                <h3 className="mb-4 text-lg font-medium">Time by Project</h3>
                <ReactApexChart 
                  type="bar"
                  height={350}
                  options={{
                    chart: { toolbar: { show: false } },
                    plotOptions: { bar: { horizontal: true, barHeight: '50%', distributed: true } },
                    xaxis: { categories: getTimeByProjectData().categories, title: { text: 'Hours' } },
                    colors: ['#6366f1', '#14b8a6', '#f97316', '#64748b', '#4f46e5', '#0d9488', '#ea580c', '#334155'],
                    legend: { show: false },
                    dataLabels: { enabled: true, formatter: function (val) { return val + ' hrs' } }
                  }}
                  series={getTimeByProjectData().series}
                />
              </div>
            </>
          )}
          
          {activeTab === 'users' && (
            <>
              <div className="card">
                <h3 className="mb-4 text-lg font-medium">Time by Team Member</h3>
                <ReactApexChart 
                  type="pie"
                  height={350}
                  options={{
                    labels: getTimeByUserData().categories,
                    legend: { position: 'bottom' },
                    colors: ['#6366f1', '#14b8a6', '#f97316', '#64748b'],
                    dataLabels: { formatter: function (val) { return Math.round(val) + '%' } }
                  }}
                  series={getTimeByUserData().series[0].data}
                />
              </div>
            </>
          )}
          
          {activeTab === 'tasks' && (
            <>
              <div className="card">
                <h3 className="mb-4 text-lg font-medium">Top Tasks by Time Spent</h3>
                <ReactApexChart 
                  type="bar"
                  height={350}
                  options={{
                    chart: { toolbar: { show: false } },
                    plotOptions: { bar: { horizontal: true } },
                    xaxis: { categories: getTimeByTaskData().categories, title: { text: 'Hours' } },
                    colors: ['#6366f1'],
                    dataLabels: { enabled: true, formatter: function (val) { return val + ' hrs' } }
                  }}
                  series={getTimeByTaskData().series}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;