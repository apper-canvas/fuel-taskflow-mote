import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Bookmark, Plus, Edit, Trash2, Check, X, Tag } from 'lucide-react';
import { templateService } from '../services/templateService';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Todo', 'In Progress', 'Done'];

// Priority colors for visual representation
const PRIORITY_COLORS = {
  'Low': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Medium': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_COLORS = {
  'Todo': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Done': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(false);
  
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
  
  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  // Fetch templates from API
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTemplates = await templateService.getAllTemplates();
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates. Please try again.');
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
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
        [name]: undefined
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    // Parse tags from comma-separated string to array
    const tagArray = templateForm.tags
      ? templateForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : [];
    
    setSavingTemplate(true);
    
    // Create or update template data
    const templateData = {
      title: templateForm.title,
      description: templateForm.description,
      project: templateForm.project,
      priority: templateForm.priority,
      status: templateForm.status,
      tags: tagArray
    };
    
    try {
      if (editingTemplate) {
        // Update existing template
        await templateService.updateTemplate({
          id: editingTemplate,
          ...templateData
        });
        toast.success("Template updated successfully!");
      } else {
        // Create new template
        await templateService.createTemplate(templateData);
        toast.success("New template created!");
      }
      
      // Refresh templates list
      fetchTemplates();
      
      // Reset form and close it
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(editingTemplate ? "Failed to update template" : "Failed to create template");
    } finally {
      setSavingTemplate(false);
    }
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
    setShowForm(false);
    setEditingTemplate(null);
    setFormErrors({});
  };
  
  // Edit a template
  const handleEditTemplate = (templateId) => {
    const templateToEdit = templates.find(template => template.id === templateId);
    if (templateToEdit) {
      setTemplateForm({
        title: templateToEdit.title,
        description: templateToEdit.description || '',
        project: templateToEdit.project || '',
        priority: templateToEdit.priority || 'Medium',
        status: templateToEdit.status || 'Todo',
        tags: templateToEdit.tags?.join(', ') || ''
      });
      setEditingTemplate(templateId);
      setShowForm(true);
    }
  };
  
  // Confirm template deletion
  const confirmDeleteTemplate = (templateId) => {
    setTemplateToDelete(templateId);
    setShowDeleteConfirmation(true);
  };
  
  // Delete a template
  const handleDeleteTemplate = async (templateId) => {
    setDeletingTemplate(true);
    try {
      await templateService.deleteTemplate(templateId);
      
      // Update local state
      setTemplates(templates.filter(template => template.id !== templateId));
      
      toast.success("Template deleted successfully!");
      setShowDeleteConfirmation(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    } finally {
      setDeletingTemplate(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-7xl px-4 py-8 pt-16 sm:px-6 sm:py-12 sm:pt-20 lg:px-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Templates</h1>
          <p className="text-surface-600 dark:text-surface-400">
            Create reusable templates for common tasks to save time.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setShowForm(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Template
        </button>
      </div>
      
      {/* Loading and error states */}
      {loading && (
        <div className="text-primary flex items-center">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span>Loading templates...</span>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {/* Template Form */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-surface-200 bg-white p-4 shadow-soft dark:border-surface-700 dark:bg-surface-800">
          <h2 className="mb-4 text-xl font-medium">
            {editingTemplate ? "Edit Template" : "Create Template"}
          </h2>
          
          <form onSubmit={handleSubmit}>
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
                  placeholder="Associated project (optional)"
                />
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
              <div>
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
                  placeholder="e.g. Meeting, Documentation, Follow-up"
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
                  placeholder="Describe the template purpose and workflow"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline"
                disabled={savingTemplate}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingTemplate}
              >
                {savingTemplate ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>{editingTemplate ? "Updating..." : "Creating..."}</span>
                  </div>
                ) : (
                  <>{editingTemplate ? "Update Template" : "Create Template"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Templates List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.length === 0 && !loading ? (
          <div className="col-span-full rounded-lg border border-surface-200 bg-white p-6 text-center dark:border-surface-700 dark:bg-surface-800">
            <Bookmark className="mx-auto mb-3 h-12 w-12 text-surface-400" />
            <h3 className="mb-1 text-lg font-medium">No templates yet</h3>
            <p className="text-surface-600 dark:text-surface-400">
              Create your first template to streamline repetitive tasks.
            </p>
          </div>
        ) : (
          templates.map(template => (
            <div
              key={template.id}
              className="rounded-lg border border-surface-200 bg-white p-4 shadow-soft transition-shadow hover:shadow-md dark:border-surface-700 dark:bg-surface-800"
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-medium">{template.title}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditTemplate(template.id)}
                    className="rounded-md bg-surface-100 p-1.5 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
                    title="Edit template"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => confirmDeleteTemplate(template.id)}
                    className="rounded-md bg-red-100 p-1.5 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    title="Delete template"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              {template.description && (
                <p className="mb-3 text-sm text-surface-600 dark:text-surface-400">
                  {template.description}
                </p>
              )}
              
              <div className="mb-3 flex flex-wrap gap-2">
                {template.tags && template.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="flex items-center rounded-full bg-surface-100 px-2 py-1 text-xs text-surface-700 dark:bg-surface-700 dark:text-surface-300"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {template.priority && (
                    <span className={`rounded-full px-2 py-1 text-xs ${PRIORITY_COLORS[template.priority]}`}>
                      {template.priority}
                    </span>
                  )}
                  
                  {template.status && (
                    <span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[template.status]}`}>
                      {template.status}
                    </span>
                  )}
                </div>
                
                {template.project && (
                  <span className="rounded-full bg-primary-light/20 px-2 py-1 text-xs text-primary-dark dark:bg-primary-dark/30 dark:text-primary-light">
                    {template.project}
                  </span>
                )}
              </div>
              
              <div className="mt-2 text-xs text-surface-500 dark:text-surface-400">
                Created {format(new Date(template.createdAt), 'MMM d, yyyy')}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-surface-800">
            <h3 className="mb-4 text-lg font-medium">Confirm Deletion</h3>
            <p className="mb-6 text-surface-600 dark:text-surface-300">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setTemplateToDelete(null);
                }}
                className="btn btn-outline"
                disabled={deletingTemplate}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTemplate(templateToDelete)}
                className="btn bg-red-500 text-white hover:bg-red-600"
                disabled={deletingTemplate}
              >
                {deletingTemplate ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  "Delete Template"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Templates;