import { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Filter, Calendar, X } from 'lucide-react';

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

const ReportFilters = ({ 
  projects = [], 
  users = [], 
  onFilterChange, 
  initialFilters = {}
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState(initialFilters.dateRange || TIME_RANGES.THIS_WEEK);
  const [startDate, setStartDate] = useState(initialFilters.startDate || format(startOfWeek(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initialFilters.endDate || format(endOfWeek(new Date()), 'yyyy-MM-dd'));
  const [selectedProject, setSelectedProject] = useState(initialFilters.project || 'All Projects');
  const [selectedUser, setSelectedUser] = useState(initialFilters.user || 'All Users');
  
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
        // Keep current dates for custom range
        break;
      default:
        setStartDate(format(startOfWeek(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(now), 'yyyy-MM-dd'));
    }
  }, [dateRange]);
  
  // Notify parent component when filters change
  useEffect(() => {
    onFilterChange({
      dateRange,
      startDate,
      endDate,
      project: selectedProject,
      user: selectedUser
    });
  }, [dateRange, startDate, endDate, selectedProject, selectedUser, onFilterChange]);

  return (
    <div className="mb-6">
      <div className="mb-4 flex justify-between">
        <h3 className="text-lg font-medium">Reports</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center rounded-md bg-surface-100 px-3 py-1 text-sm hover:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600"
        >
          {showFilters ? <X className="mr-1 h-4 w-4" /> : <Filter className="mr-1 h-4 w-4" />}
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {showFilters && (
        <div className="mb-6 rounded-lg border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
          {/* Filter content will be implemented here */}
        </div>
      )}
    </div>
  );
};

export default ReportFilters;