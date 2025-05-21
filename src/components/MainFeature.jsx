import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';

// Icons
const PlusIcon = getIcon('plus');
const TrashIcon = getIcon('trash-2');
const EditIcon = getIcon('edit-3');
const CheckIcon = getIcon('check');
const XIcon = getIcon('x');
const AlertCircleIcon = getIcon('alert-circle');
const ClockIcon = getIcon('clock');
const FlagIcon = getIcon('flag');
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

// Sample initial tasks
const initialTasks = [
  {
    id: 1,
    title: 'Design new dashboard layout',
    description: 'Create wireframes and mockups for the new analytics dashboard',
    dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
    priority: 'High',
    status: 'In Progress',
    tags: ['Design', 'UI/UX']
  },
  {
    id: 2,
    title: 'Fix search functionality',
    description: 'Debug and resolve issues with the search feature in the app',
    dueDate: new Date(Date.now() + 86400000), // 1 day from now
    priority: 'Urgent',
    status: 'To Do',
    tags: ['Bug', 'Frontend']
  },
  {
    id: 3,
    title: 'Weekly team meeting',
    description: 'Prepare agenda for the weekly team sync meeting',
    dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
    priority: 'Medium',
    status: 'To Do',
    tags: ['Meeting', 'Planning']
  }
];

const MainFeature = () => {
  // State for tasks management
  const [tasks, setTasks] = useState(initialTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState('All');
  const [sortOption, setSortOption] = useState('dueDate');
  const [editingTask, setEditingTask] = useState(null);
  
  // Form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow as default
    priority: 'Medium',
    status: 'To Do',
    tags: ''
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Effect to handle form editing
  useEffect(() => {
    if (editingTask) {
      const taskToEdit = tasks.find(task => task.id === editingTask);
      if (taskToEdit) {
        setTaskForm({
          title: taskToEdit.title,
          description: taskToEdit.description,
          dueDate: format(new Date(taskToEdit.dueDate), 'yyyy-MM-dd'),
          priority: taskToEdit.priority,
          status: taskToEdit.status,
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
    
    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortOption === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortOption === 'priority') {
        const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortOption === 'status') {
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
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
    
    // Update or create task
    if (editingTask) {
      // Update existing task
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === editingTask 
            ? {
                ...task,
                title: taskForm.title,
                description: taskForm.description,
                dueDate: new Date(taskForm.dueDate),
                priority: taskForm.priority,
                status: taskForm.status,
                tags: tagArray
              }
            : task
        )
      );
      toast.success("Task updated successfully!");
    } else {
      // Create new task
      const newTask = {
        id: Date.now(), // Simple ID generation
        title: taskForm.title,
        description: taskForm.description,
        dueDate: new Date(taskForm.dueDate),
        priority: taskForm.priority,
        status: taskForm.status,
        tags: tagArray
      };
      
      setTasks(prev => [...prev, newTask]);
      toast.success("New task created!");
    }
    
    // Reset form and close it
    resetForm();
  };
  
  // Reset form to defaults
  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow
      priority: 'Medium',
      status: 'To Do',
      tags: ''
    });
    setShowTaskForm(false);
    setEditingTask(null);
    setFormErrors({});
  };
  
  // Delete a task
  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success("Task deleted successfully!");
  };
  
  // Change task status quickly
  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      )
    );
    toast.info(`Task marked as ${newStatus}`);
  };
  
  // Edit a task
  const handleEditTask = (taskId) => {
    setEditingTask(taskId);
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
                  {/* Due Date */}
                  <div className={`flex items-center text-xs ${dueDateInfo.className}`}>
                    <ClockIcon className="mr-1 h-3 w-3" />
                    <span>{dueDateInfo.label}</span>
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
                      onClick={() => handleDeleteTask(task.id)}
                      className="rounded-md bg-red-100 p-1.5 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
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
    </div>
  );
};

export default MainFeature;