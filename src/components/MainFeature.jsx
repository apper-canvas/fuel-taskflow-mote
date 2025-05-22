import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { getIcon } from '../utils/iconUtils';
import { selectAllTemplates } from '../store/templatesSlice';
import { formatDuration } from '../utils/timeUtils'; 
import TimeTracker from './TimeTracker';
import { 
  selectAllTasks, createTask, updateTask, deleteTask, 
  changeTaskStatus, addTimeEntry, deleteTimeEntry, stopTimer,
  selectAllProjects
} from '../store';

// Icons
const PlusIcon = getIcon('plus');
const CheckIcon = getIcon('check');
const XIcon = getIcon('x');
const AlertCircleIcon = getIcon('alert-circle');
const ClockIcon = getIcon('clock');
const TimerIcon = getIcon('timer');
const FlagIcon = getIcon('flag');
const BookmarkIcon = getIcon('bookmark');
const TrashIcon = getIcon('trash-2');
const EditIcon = getIcon('edit-3');
const TagIcon = getIcon('tag');

// Initial task status options
const STATUSES = ['To Do', 'In Progress', 'In Review', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

// Priority colors for visual representation
const PRIORITY_COLORS = {
  'Low': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Medium': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

// Status colors for visual representation
const STATUS_COLORS = {
  'To Do': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'In Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const MainFeature = () => {
  // State for tasks management
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState('All');
  const [filteredProject, setFilteredProject] = useState('All Projects');
  const [sortOption, setSortOption] = useState('dueDate');
  const [editingTask, setEditingTask] = useState(null);
  
  // Form state
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    templateId: '', 
    dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow as default
    project: '',
    priority: 'Medium',
    status: 'To Do',
    tags: ''
  });

  // Redux state
  const tasks = useSelector(selectAllTasks);
  const projects = useSelector(selectAllProjects);
  const templates = useSelector(selectAllTemplates);
  const activeTimer = useSelector(state => state.timer.activeTimer);
  const dispatch = useDispatch();
  const [showTimeEntryForm, setShowTimeEntryForm] = useState(false);
  const [selectedTaskForTimeEntry, setSelectedTaskForTimeEntry] = useState(null);
  // Time entry form state
  const [timeEntryForm, setTimeEntryForm] = useState({
    hours: '0',
    minutes: '0',
    description: ''
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Confirmation dialog state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  // Effect to handle form editing
  useEffect(() => {
    if (editingTask) {
      const taskToEdit = tasks.find(task => task.id === editingTask);
      if (taskToEdit) {
        setTaskForm({
          title: taskToEdit.title,
          description: taskToEdit.description,
          projectId: taskToEdit.projectId?.toString() || '',
          dueDate: format(new Date(taskToEdit.dueDate), 'yyyy-MM-dd'),
          priority: taskToEdit.priority,
          status: taskToEdit.status,
          project: taskToEdit.project || '',
          tags: taskToEdit.tags.join(', ')
        });
        setShowTaskForm(true);
      }
    }
  }, [editingTask, tasks]);
  
  // Function to filter tasks based on selected status
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Apply status filter if not "All"
    if (filteredStatus !== 'All') {
      filtered = filtered.filter(task => task.status === filteredStatus);
    }

    // Apply project filter if not "All Projects"
    if (filteredProject !== 'All Projects') {
      filtered = filtered.filter(task => task.project === filteredProject);
    }
    
    
    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortOption === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortOption === 'priority') {
        const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } 
      
      // Sort by status
      if (sortOption === 'status') {
        const statusOrder = { 'To Do': 0, 'In Progress': 1, 'In Review': 2, 'Completed': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Special handling for template selection
    if (name === 'templateId' && value) {
      const selectedTemplate = templates.find(t => t.id === parseInt(value));
      
      if (selectedTemplate) {
        // Pre-populate form with template data
        setTaskForm(prev => ({
          ...prev,
          templateId: value,
          title: selectedTemplate.title,
          projectId: selectedTemplate.projectId || prev.projectId,
          description: selectedTemplate.description,
          priority: selectedTemplate.priority,
          status: selectedTemplate.status,
          tags: selectedTemplate.tags.join(', '),
          project: selectedTemplate.project || prev.project
        }));
        
        // Clear form errors
        setFormErrors({});
        
        // Notify user
        toast.info(`Template "${selectedTemplate.title}" applied`);
        return;
      }
    }
    
    // Regular form field handling
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Reset template selection if editing fields that would be set by a template
    if (['title', 'description', 'status', 'priority', 'tags', 'projectId'].includes(name) && taskForm.templateId) {
      setTaskForm(prev => ({ ...prev, templateId: '' }));
    }
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!taskForm.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!taskForm.dueDate) {
      errors.dueDate = 'Due date is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    // Parse tags from comma-separated string to array
    const tagArray = taskForm.tags
      ? taskForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : [];
    
    // Set project name from selected project ID if available
    let projectName = taskForm.project;
    if (taskForm.projectId) {
      const selectedProject = projects.find(p => p.id.toString() === taskForm.projectId);
      if (selectedProject) {
        projectName = selectedProject.name;
      }
    }
    
    // Update or create task
    if (editingTask) {
      // Update existing task
      dispatch(updateTask({
        id: editingTask,
        title: taskForm.title,
        projectId: taskForm.projectId ? parseInt(taskForm.projectId) : null,
        description: taskForm.description,
        project: projectName || '',
        dueDate: new Date(taskForm.dueDate),
        priority: taskForm.priority,
        status: taskForm.status,
        tags: tagArray
      }));
      toast.success("Task updated successfully!");
    } else {
      // Create new task
      dispatch(createTask({
        title: taskForm.title,
        projectId: taskForm.projectId ? parseInt(taskForm.projectId) : null,
        description: taskForm.description,
        project: projectName || '',
        dueDate: new Date(taskForm.dueDate),
        priority: taskForm.priority,
        status: taskForm.status,
        tags: tagArray
      }));
      toast.success("New task created!");
    }
    
    // Reset form and close it
    resetForm();
  };
  
  // Reset form to defaults
  const resetForm = () => {
    setTaskForm({
      projectId: '',
      templateId: '',
      title: '',
      description: '',
      project: '',
      dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow
      priority: 'Medium',
      status: 'To Do',
      tags: ''
    });
    setShowTaskForm(false);
    setEditingTask(null);
    setFormErrors({});
  };
  
  // Handle time entry form input changes
  const handleTimeEntryInputChange = (e) => {
    const { name, value } = e.target;
    setTimeEntryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add time entry manually
  const handleAddTimeEntry = (e) => {
    e.preventDefault();
    
    const hours = parseInt(timeEntryForm.hours) || 0;
    const minutes = parseInt(timeEntryForm.minutes) || 0;
    const totalSeconds = (hours * 60 * 60) + (minutes * 60);
    
    if (totalSeconds <= 0) {
      toast.error("Please enter a valid time duration");
      return;
    }
    
    const newTimeEntry = {
      id: Date.now(),
      startTime: new Date(new Date().getTime() - (totalSeconds * 1000)),
      endTime: new Date(),
      duration: totalSeconds,
      description: timeEntryForm.description.trim()
    };
    
    dispatch(addTimeEntry({
      taskId: selectedTaskForTimeEntry,
      timeEntry: newTimeEntry
    }));
    setShowTimeEntryForm(false);
    setSelectedTaskForTimeEntry(null);
    toast.success("Time entry added successfully!");
  };
  
  // Delete a task
  const handleDeleteTask = (taskId) => {
    dispatch(deleteTask(taskId));
    toast.success("Task deleted successfully!");
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
  };
  
  // Confirm task deletion
  const confirmDeleteTask = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirmation(true);
  };
  
  // Change task status quickly
  const handleStatusChange = (taskId, newStatus) => {
    dispatch(changeTaskStatus({
      taskId, newStatus
    })
    );
    toast.info(`Task marked as ${newStatus}`);
  };
  
  // Edit a task
  const handleEditTask = (taskId) => {
    setEditingTask(taskId);
  };

  // Handle time entry completed from timer
  const handleTimeEntryCompleted = (taskId, seconds, startTime, endTime) => {
    addTimeEntryToTask(taskId, seconds, '', startTime, endTime);
    toast.success("Time tracked successfully!");
  };

  // Add a time entry from timer
  const addTimeEntryToTask = (taskId, seconds, description, startTime = null, endTime = null) => {
    const newTimeEntry = {
      id: Date.now(),
      startTime: startTime || new Date(new Date().getTime() - (seconds * 1000)),
      endTime: endTime || new Date(),
      duration: seconds,
      description: description.trim()
    };
    
    dispatch(addTimeEntry({ taskId, timeEntry: newTimeEntry }));
    toast.success("Time entry added");
  };

  // Calculate total time spent on a task
  const getTotalTimeForTask = (taskTimeEntries) => {
    if (!taskTimeEntries || taskTimeEntries.length === 0) return 0;
    return taskTimeEntries.reduce((total, entry) => total + entry.duration, 0);
  };

  // Delete a time entry
  const handleDeleteTimeEntry = (taskId, entryId) => {
    dispatch(deleteTimeEntry({
      taskId, entryId
    }));
    toast.success("Time entry deleted successfully");
  };
  
  // Calculate due date label and style
  const getDueDateInfo = (dueDate) => {
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    const diffTime = taskDueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Overdue', className: 'text-red-600 dark:text-red-400' };
    } else if (diffDays === 0) {
      return { label: 'Due today', className: 'text-orange-600 dark:text-orange-400' };
    } else if (diffDays === 1) {
      return { label: 'Due tomorrow', className: 'text-yellow-600 dark:text-yellow-400' };
    } else if (diffDays <= 3) {
      return { label: `Due in ${diffDays} days`, className: 'text-yellow-600 dark:text-yellow-400' };
    } else {
      return { label: format(taskDueDate, 'MMM d, yyyy'), className: 'text-surface-600 dark:text-surface-400' };
    }
  };
  
  return (
    <div className="rounded-xl bg-white p-6 shadow-soft dark:bg-surface-800">
      {/* Task Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold sm:mr-4">Tasks</h3>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="statusFilter" className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Status:
            </label>
            <select
              id="statusFilter"
              value={filteredStatus}
              onChange={(e) => setFilteredStatus(e.target.value)}
              className="rounded-md border border-surface-200 bg-white py-1 pl-3 pr-8 text-sm focus:ring-2 focus:ring-primary dark:border-surface-700 dark:bg-surface-800"
            >
              <option value="All">All</option>
              {STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="projectFilter" className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Project:
            </label>
            <select
              id="projectFilter"
              value={filteredProject}
              onChange={(e) => setFilteredProject(e.target.value)}
              className="rounded-md border border-surface-200 bg-white py-1 pl-3 pr-8 text-sm focus:ring-2 focus:ring-primary dark:border-surface-700 dark:bg-surface-800"
            >
              <option value="All Projects">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.name}>{project.name}</option>
              ))}
            </select>
          </div>
          
          
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <label htmlFor="sortOption" className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Sort by:
            </label>
            <select
              id="sortOption"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-md border border-surface-200 bg-white py-1 pl-3 pr-8 text-sm focus:ring-2 focus:ring-primary dark:border-surface-700 dark:bg-surface-800"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        
        {/* Add Task Button */}
        <button
          onClick={() => {
            setEditingTask(null);
            setShowTaskForm(true);
          }}
          className="btn btn-primary whitespace-nowrap"
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          Add Task
        </button>
      </div>
      
      {/* Task Form */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <form 
              onSubmit={handleSubmit}
              className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900"
            >
              <h4 className="mb-4 text-lg font-medium">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h4>
              
              {/* Template selector (only show when creating a new task) */}
              {!editingTask && (
                <div className="mb-4">
                  <label htmlFor="templateId" className="mb-1 block text-sm font-medium">
                    Use Template
                  </label>
                  <select
                    id="templateId"
                    name="templateId"
                    value={taskForm.templateId}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    <option value="">Select a template (optional)</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.title}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                {/* Title */}
                <div className="col-span-full">
                  <label htmlFor="title" className="mb-1 block text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={taskForm.title}
                    onChange={handleInputChange}
                    className={`input w-full ${formErrors.title ? 'border-red-500 ring-red-500' : ''}`}
                    placeholder="Enter task title"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>
                  )}
                </div>
                
                {/* Project */}
                <div className="col-span-full md:col-span-1">
                  <label htmlFor="projectId" className="mb-1 block text-sm font-medium">
                    Project
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    value={taskForm.projectId}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    <option value="">No Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Project Name (only if no project selected) */}
                {!taskForm.projectId && (
                  <div className="col-span-full md:col-span-1">
                    <label htmlFor="project" className="mb-1 block text-sm font-medium">Custom Project Name</label>
                    <input type="text" id="project" name="project" value={taskForm.project} 
                      onChange={handleInputChange} className="input w-full" 
                      placeholder="Enter custom project name" />
                  </div>
                )}
                {/* Description */}
                <div className="col-span-full">
                  <label htmlFor="description" className="mb-1 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={taskForm.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="input w-full"
                    placeholder="Describe the task details"
                  ></textarea>
                </div>
                
                {/* Due Date */}
                <div>
                  <label htmlFor="dueDate" className="mb-1 block text-sm font-medium">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={taskForm.dueDate}
                    onChange={handleInputChange}
                    className={`input w-full ${formErrors.dueDate ? 'border-red-500 ring-red-500' : ''}`}
                  />
                  {formErrors.dueDate && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.dueDate}</p>
                  )}
                </div>
                
                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="mb-1 block text-sm font-medium">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="mb-1 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={taskForm.status}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="mb-1 block text-sm font-medium">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={taskForm.tags}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Design, Frontend, Bug"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline"
                >
                  <XIcon className="mr-1 h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <CheckIcon className="mr-1 h-4 w-4" />
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Task List */}
      <div className="space-y-3">
        {getFilteredTasks().length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-300 bg-surface-50 py-10 text-center dark:border-surface-700 dark:bg-surface-900/50">
            <AlertCircleIcon className="mb-2 h-10 w-10 text-surface-400" />
            <h4 className="mb-1 text-lg font-medium">No tasks found</h4>
            <p className="text-sm text-surface-500">
              {filteredStatus !== 'All' 
                ? `No tasks with "${filteredStatus}" status`
                : "Create your first task by clicking the 'Add Task' button"}
            </p>
          </div>
        ) : (
          getFilteredTasks().map(task => {
            const dueDateInfo = getDueDateInfo(task.dueDate);
            const totalTime = getTotalTimeForTask(task.timeEntries);
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-lg border p-4 transition-shadow hover:shadow-soft ${
                  task.status === 'Completed'
                    ? 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10'
                    : 'border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className={`font-medium ${
                    task.status === 'Completed' ? 'text-green-800 dark:text-green-400' : ''
                  }`}>
                    {task.title}
                    
                    {/* Project Tag if exists */}
                    {task.project && (
                      <span 
                        className="ml-2 inline-flex items-center rounded-full bg-primary-light/20 px-2 py-0.5 text-xs text-primary-dark dark:bg-primary-dark/30 dark:text-primary-light"
                        style={{
                          backgroundColor: task.projectId && projects.find(p => p.id === task.projectId)?.color + '20',
                          color: task.projectId && projects.find(p => p.id === task.projectId)?.color
                        }}
                      >
                        {task.project}
                      </span>
                    )}
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    {/* Status Badge */}
                    <span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[task.status]}`}>
                      {task.status}
                    </span>
                    
                    {/* Priority Badge */}
                    <span className={`rounded-full px-2 py-1 text-xs ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                
                {/* Description if exists */}
                {task.description && (
                  <p className="mb-3 text-sm text-surface-600 dark:text-surface-400">
                    {task.description}
                  </p>
                )}
                
                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="flex items-center rounded-full bg-surface-100 px-2 py-1 text-xs text-surface-700 dark:bg-surface-700 dark:text-surface-300"
                      >
                        <TagIcon className="mr-1 h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    {/* Due Date */}
                    <div className={`flex items-center text-xs ${dueDateInfo.className}`}>
                      <ClockIcon className="mr-1 h-3 w-3" />
                      <span>{dueDateInfo.label}</span>
                    </div>
                    
                    {/* Time Tracking Summary */}
                    <button 
                      onClick={() => {
                        // Toggle time entries visibility
                        const element = document.getElementById(`time-entries-${task.id}`);
                        if (element) {
                          element.classList.toggle('hidden');
                        }
                      }}
                      className="flex items-center text-xs text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
                    >
                      <TimerIcon className="mr-1 h-3 w-3" />
                      <span>{formatDuration(totalTime)} logged</span>
                    </button>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-1">
                    {/* Time tracking controls */}
                    <TimeTracker 
                      taskId={task.id} 
                      onTimeEntryCompleted={handleTimeEntryCompleted}
                      isActive={activeTimer && activeTimer.taskId === task.id}
                    />
                    
                    {/* Manual time entry button */}
                    <button
                      onClick={() => {
                        setSelectedTaskForTimeEntry(task.id);
                        setShowTimeEntryForm(true);
                      }}
                      className="rounded-md bg-primary-light p-1.5 text-primary-dark hover:bg-primary/20 dark:bg-primary-dark/30 dark:text-primary-light dark:hover:bg-primary-dark/50"
                      title="Log time manually"
                    >
                      <ClockIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Time Entries List (Hidden by default) */}
                <div id={`time-entries-${task.id}`} className="mt-3 hidden rounded-md border border-surface-200 p-2 dark:border-surface-700">
                  <h5 className="mb-2 text-xs font-medium">Time Entries</h5>
                  {task.timeEntries && task.timeEntries.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                      {task.timeEntries.map((entry) => (
                        <div key={entry.id} className="mb-1 flex items-center justify-between border-b border-surface-100 pb-1 text-xs dark:border-surface-700">
                          <div>
                            <div>{format(new Date(entry.startTime), 'MMM d, h:mm a')} - {format(new Date(entry.endTime), 'h:mm a')}</div>
                            <div className="text-surface-500 dark:text-surface-400">
                              {formatDuration(entry.duration)}
                              {entry.description && ` • ${entry.description}`}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteTimeEntry(task.id, entry.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-surface-500">No time entries yet</p>
                  )}
                </div>
                
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className={`flex items-center text-xs ${dueDateInfo.className}`}>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-1">
                    {/* Status Actions - only show if not completed */}
                    {task.status !== 'Completed' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'Completed')}
                        className="rounded-md bg-green-100 p-1.5 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                        title="Mark as completed"
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                    
                    {/* Edit button */}
                    <button
                      onClick={() => handleEditTask(task.id)}
                      className="rounded-md bg-surface-100 p-1.5 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
                      title="Edit task"
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => confirmDeleteTask(task.id)}
                      className="rounded-md bg-red-100 p-1.5 text-red-700 hover:bg-red-200 
                        dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      title="Delete task"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && taskToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-surface-800"
            >
              <h3 className="mb-4 text-lg font-medium">Confirm Deletion</h3>
              <p className="mb-6 text-surface-600 dark:text-surface-300">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setTaskToDelete(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTask(taskToDelete)}
                  className="btn bg-red-500 text-white hover:bg-red-600"
                >
                  Delete Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Manual Time Entry Form Modal */}
      <AnimatePresence>
        {showTimeEntryForm && selectedTaskForTimeEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-surface-800"
            >
              <h3 className="mb-4 text-lg font-medium">Log Time Manually</h3>
              <form onSubmit={handleAddTimeEntry}>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hours" className="mb-1 block text-sm font-medium">Hours</label>
                    <input
                      type="number"
                      id="hours"
                      name="hours"
                      min="0"
                      value={timeEntryForm.hours}
                      onChange={handleTimeEntryInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="minutes" className="mb-1 block text-sm font-medium">Minutes</label>
                    <input
                      type="number"
                      id="minutes"
                      name="minutes"
                      min="0"
                      max="59"
                      value={timeEntryForm.minutes}
                      onChange={handleTimeEntryInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="description" className="mb-1 block text-sm font-medium">Description (optional)</label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={timeEntryForm.description}
                      onChange={handleTimeEntryInputChange}
                      className="input w-full"
                      placeholder="What did you work on?"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTimeEntryForm(false);
                      setSelectedTaskForTimeEntry(null);
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Add Time Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;