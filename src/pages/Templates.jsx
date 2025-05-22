import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Bookmark, Edit, Trash2, Plus, Check, X, Filter, AlertCircle, Tag, Clipboard } from 'lucide-react';
import { selectAllTemplates, createTemplate, updateTemplate, deleteTemplate } from '../store/templatesSlice';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Todo', 'In Progress', 'Done'];

// Priority colors for visual representation
const PRIORITY_COLORS = {
  'Low': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Medium': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

// Status colors for visual representation
const STATUS_COLORS = {
  'Todo': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Done': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const Templates = () => {
  const dispatch = useDispatch();
  const templates = useSelector(selectAllTemplates);
  
  // State for managing templates UI
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Form state
  const [templateForm, setTemplateForm] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'Medium',
    status: 'Todo',
    tags: ''
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Effect to handle editing template
  useEffect(() => {
    if (editingTemplateId) {
      const templateToEdit = templates.find(t => t.id === editingTemplateId);
      if (templateToEdit) {
        setTemplateForm({
          title: templateToEdit.title,
          description: templateToEdit.description,
          project: templateToEdit.project || '',
          priority: templateToEdit.priority,
          status: templateToEdit.status,
          tags: templateToEdit.tags.join(', ')
        });
        setShowTemplateForm(true);
      }
    }
  }, [editingTemplateId, templates]);
  
  // Get filtered and sorted templates
  const getFilteredTemplates = () => {
    let filtered = [...templates];
    
    // Apply text filter if provided
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(lowerFilter) || 
        template.description.toLowerCase().includes(lowerFilter) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowerFilter))
      );
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOption === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOption === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplateForm(prev => ({
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
    
    if (!templateForm.title.trim()) {
      errors.title = 'Title is required';
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
    const tagArray = templateForm.tags
      ? templateForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : [];
    
    if (editingTemplateId) {
      // Update existing template
      dispatch(updateTemplate({
        id: editingTemplateId,
        title: templateForm.title,
        description: templateForm.description,
        project: templateForm.project,
        priority: templateForm.priority,
        status: templateForm.status,
        tags: tagArray
      }));
      toast.success("Template updated successfully!");
    } else {
      // Create new template
      dispatch(createTemplate({
        title: templateForm.title,
        description: templateForm.description,
        project: templateForm.project,
        priority: templateForm.priority,
        status: templateForm.status,
        tags: tagArray
      }));
      toast.success("Template created successfully!");
    }
    
    // Reset form and close it
    resetForm();
  };
  
  // Reset form to defaults
  const resetForm = () => {
    setTemplateForm({
      title: '',
      description: '',
      project: '',
      priority: 'Medium',
      status: 'Todo',
      tags: ''
    });
    setShowTemplateForm(false);
    setEditingTemplateId(null);
    setFormErrors({});
  };
  
  // Handle template deletion
  const handleDeleteTemplate = (templateId) => {
    dispatch(deleteTemplate(templateId));
    setShowDeleteConfirm(null);
    toast.success("Template deleted successfully!");
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Templates</h1>
            <p className="mt-1 text-surface-600 dark:text-surface-400">
              Create reusable templates for common task sequences
            </p>
          </div>
          
          <button
            onClick={() => {
              setEditingTemplateId(null);
              setShowTemplateForm(true);
            }}
            className="btn btn-primary whitespace-nowrap"
          >
            <Plus className="mr-1 h-4 w-4" />
            New Template
          </button>
        </div>
        
        {/* Filter and sort controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filter templates..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input pl-10 w-full max-w-xs"
            />
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-md border border-surface-200 bg-white py-1 pl-3 pr-8 text-sm focus:ring-2 focus:ring-primary dark:border-surface-700 dark:bg-surface-800"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
        
        {/* Template creation/edit form */}
        <AnimatePresence>
          {showTemplateForm && (
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
                  {editingTemplateId ? "Edit Template" : "Create New Template"}
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
                      value={templateForm.title}
                      onChange={handleInputChange}
                      className={`input w-full ${formErrors.title ? 'border-red-500 ring-red-500' : ''}`}
                      placeholder="Enter template title"
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>
                    )}
                  </div>
                  
                  {/* Project */}
                  <div>
                    <label htmlFor="project" className="mb-1 block text-sm font-medium">
                      Project
                    </label>
                    <input
                      type="text"
                      id="project"
                      name="project"
                      value={templateForm.project}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="Enter project name"
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="col-span-full">
                    <label htmlFor="description" className="mb-1 block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={templateForm.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="input w-full"
                      placeholder="Describe the template purpose and tasks"
                    ></textarea>
                  </div>
                  
                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="mb-1 block text-sm font-medium">
                      Default Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={templateForm.priority}
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
                      Default Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={templateForm.status}
                      onChange={handleInputChange}
                      className="input w-full"
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Tags */}
                  <div className="col-span-full">
                    <label htmlFor="tags" className="mb-1 block text-sm font-medium">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={templateForm.tags}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="Meeting, Planning, Development"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    {editingTemplateId ? "Update Template" : "Create Template"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Templates list */}
        <div className="space-y-4">
          {getFilteredTemplates().length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-300 bg-surface-50 py-10 text-center dark:border-surface-700 dark:bg-surface-900/50">
              <Bookmark className="mb-2 h-10 w-10 text-surface-400" />
              <h4 className="mb-1 text-lg font-medium">No templates found</h4>
              <p className="text-sm text-surface-500">
                {filter 
                  ? `No templates match "${filter}"`
                  : "Create your first template by clicking the 'New Template' button"}
              </p>
            </div>
          ) : (
            getFilteredTemplates().map(template => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-lg border border-surface-200 bg-white p-4 transition-shadow hover:shadow-soft dark:border-surface-700 dark:bg-surface-800"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center">
                    <Bookmark className="mr-2 h-4 w-4 text-primary" />
                    <h4 className="font-medium">{template.title}</h4>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Status Badge */}
                    <span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[template.status]}`}>
                      {template.status}
                    </span>
                    
                    {/* Priority Badge */}
                    <span className={`rounded-full px-2 py-1 text-xs ${PRIORITY_COLORS[template.priority]}`}>
                      {template.priority}
                    </span>
                  </div>
                </div>
                
                {/* Description if exists */}
                {template.description && (
                  <p className="mb-3 text-sm text-surface-600 dark:text-surface-400">
                    {template.description}
                  </p>
                )}
                
                {/* Project if exists */}
                {template.project && (
                  <p className="mb-3 text-xs text-surface-500 dark:text-surface-400">
                    Project: {template.project}
                  </p>
                )}
                
                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {template.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="flex items-center rounded-full bg-surface-100 px-2 py-1 text-xs text-surface-700 dark:bg-surface-700 dark:text-surface-300"
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-surface-500 dark:text-surface-400">
                    Created: {format(new Date(template.createdAt), 'MMM d, yyyy')}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Apply template button - available in task creation context */}
                    <button
                      onClick={() => {
                        // Navigate to task creation with this template
                        window.location.href = '/?template=' + template.id;
                      }}
                      className="rounded-md bg-primary/10 p-1.5 text-primary hover:bg-primary/20 dark:bg-primary-dark/30 dark:text-primary-light dark:hover:bg-primary-dark/50"
                      title="Use this template"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                    </button>
                    
                    {/* Edit button */}
                    <button
                      onClick={() => setEditingTemplateId(template.id)}
                      className="rounded-md bg-surface-100 p-1.5 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
                      title="Edit template"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => setShowDeleteConfirm(template.id)}
                      className="rounded-md bg-red-100 p-1.5 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      title="Delete template"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Delete confirmation */}
                <AnimatePresence>
                  {showDeleteConfirm === template.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden rounded-md bg-red-50 p-3 dark:bg-red-900/20"
                    >
                      <p className="mb-2 text-sm text-red-800 dark:text-red-300">
                        Are you sure you want to delete this template?
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="rounded-md bg-surface-200 px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Templates;