import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { toast } from 'react-toastify';
import { fetchProjects, createProject } from '../services/projectService';
import { 
  selectAllProjects, createProject, updateProject, deleteProject,
  selectAllTasks
} from '../store';
import { formatDuration } from '../utils/timeUtils';
import { getIcon } from '../utils/iconUtils';
import { useNavigate } from 'react-router-dom';

// Icons
const PlusIcon = getIcon('plus');
const CheckIcon = getIcon('check');
const XIcon = getIcon('x');
const AlertCircleIcon = getIcon('alert-circle');
  const [projects, setProjects] = useState([]);
const TrashIcon = getIcon('trash-2');
const FolderIcon = getIcon('folder');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
const FolderPlusIcon = getIcon('folder-plus');
const ListIcon = getIcon('list');

const Projects = () => {
  // State for projects management
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    // Fetch projects from the database
    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
        toast.error('Failed to load projects');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  });
  const [formErrors, setFormErrors] = useState({});
  // Confirmation dialog state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Redux state
  const projects = useSelector(selectAllProjects);
  const tasks = useSelector(selectAllTasks);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Effect to handle form editing
  const handleEditProject = (projectId) => {
    const projectToEdit = projects.find(project => project.id === projectId);
    if (projectToEdit) {
      setProjectForm({
  const handleSubmit = async () => {
    setIsCreating(true);
    
        description: projectToEdit.description,
      toast.error('Project name is required');
      setIsCreating(false);
      });
      setEditingProject(projectId);
      setShowProjectForm(true);
    try {
      // Create project in the database using the service
      const projectData = {
        name: newProject.name,
        description: newProject.description,
        color: newProject.color,
        tags: newProject.tags
      };
      
      const createdProject = await createProject(projectData);
      
      // Update local state with the new project
      setProjects(prevProjects => [createdProject, ...prevProjects]);
      
      // Close modal and reset form
      setIsNewProjectModalOpen(false);
      setNewProject({
        name: '',
        description: '',
        color: projectColors[0],
        tags: ''
      });
      
      toast.success('Project created successfully');
    } catch (err) {
      toast.error('Failed to create project');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'createdAt') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOption === 'taskCount') {
        const tasksInA = tasks.filter(task => task.projectId === a.id).length;
        const tasksInB = tasks.filter(task => task.projectId === b.id).length;
        return tasksInB - tasksInA;
      }
      return 0;
    });
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    (project.Name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
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
    
    if (!projectForm.name.trim()) {
      
      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      errors.name = 'Project name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

            to={`/projects/${project.Id}`}
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
              style={{ backgroundColor: project.color || '#4F46E5' }}
      return;
    }
    
    // Update or create project
                <h3 className="text-lg font-semibold">{project.Name}</h3>
      // Update existing project
      dispatch(updateProject({
        id: editingProject,
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
        color: projectForm.color
      }));
                {(project.Tags || '').split(',').filter(Boolean).map((tag, index) => (
    } else {
      // Create new project
                    className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-2 py-1 text-xs font-medium"
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
        color: projectForm.color
      }));
      toast.success("New project created!");
    }
    
    // Reset form and close it
                Created: {new Date(project.CreatedOn).toLocaleDateString()}
  };

  // Reset form to defaults
  const resetForm = () => {
    setProjectForm({
      name: '',
      description: '',
      color: '#4f46e5'
    });
    setShowProjectForm(false);
    setEditingProject(null);
    setFormErrors({});
  };

  // Delete a project
  const handleDeleteProject = (projectId) => {
    dispatch(deleteProject(projectId));
    toast.success("Project deleted successfully!");
    setShowDeleteConfirmation(false);
    setProjectToDelete(null);
  };

  // Confirm project deletion
  const confirmDeleteProject = (projectId) => {
    setProjectToDelete(projectId);
    setShowDeleteConfirmation(true);
  };

  // Calculate project statistics
  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const taskCount = projectTasks.length;
    const completedCount = projectTasks.filter(task => task.status === 'Completed').length;
    
    // Calculate total time spent on project tasks
    let totalTime = 0;
    projectTasks.forEach(task => {
      totalTime += task.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    });
    
    return { taskCount, completedCount, totalTime };
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      <div className="mb-8 rounded-xl bg-white p-6 shadow-soft dark:bg-surface-800">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <FolderIcon className="mr-3 h-6 w-6 text-primary" />
                    <button onClick={handleSubmit} disabled={isCreating} className="px-4 py-2 bg-primary text-white rounded-md">
                      {isCreating ? 'Creating...' : 'Create Project'}
                    </button>
          </div>
          
          <button
            onClick={() => {
              setEditingProject(null);
              setShowProjectForm(true);
            }}
            className="btn btn-primary whitespace-nowrap"
          >
            <FolderPlusIcon className="mr-2 h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Project Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
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
              <option value="name">Name</option>
              <option value="createdAt">Recently Created</option>
              <option value="taskCount">Task Count</option>
            </select>
          </div>
        </div>

        {/* Project Form */}
        <AnimatePresence>
          {showProjectForm && (
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
                  {editingProject ? "Edit Project" : "Create New Project"}
                </h4>
                
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  {/* Project Name */}
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={projectForm.name}
                      onChange={handleInputChange}
                      className={`input w-full ${formErrors.name ? 'border-red-500 ring-red-500' : ''}`}
                      placeholder="Enter project name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  
                  {/* Project Color */}
                  <div>
                    <label htmlFor="color" className="mb-1 block text-sm font-medium">
                      Color
                    </label>
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={projectForm.color}
                      onChange={handleInputChange}
                      className="h-10 w-full cursor-pointer rounded border border-surface-200 p-1 dark:border-surface-700"
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
                      value={projectForm.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="input w-full"
                      placeholder="Describe the project"
                    ></textarea>
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
                    {editingProject ? "Update Project" : "Create Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects List */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {getFilteredProjects().length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-300 bg-surface-50 py-10 text-center dark:border-surface-700 dark:bg-surface-900/50">
              <AlertCircleIcon className="mb-2 h-10 w-10 text-surface-400" />
              <h4 className="mb-1 text-lg font-medium">No projects found</h4>
              <p className="text-sm text-surface-500">
                {searchTerm 
                  ? `No projects match "${searchTerm}"`
                  : "Create your first project by clicking the 'New Project' button"}
              </p>
            </div>
          ) : (
            getFilteredProjects().map(project => {
              const { taskCount, completedCount, totalTime } = getProjectStats(project.id);
              
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-lg border border-surface-200 bg-white p-4 shadow-soft transition-shadow hover:shadow-md dark:border-surface-700 dark:bg-surface-800"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={{ borderLeftWidth: '4px', borderLeftColor: project.color, cursor: 'pointer' }}
                  style={{ borderLeftWidth: '4px', borderLeftColor: project.color }}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-medium" style={{ color: project.color }}>
                      {project.name}
                    </h3>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigation
                          handleEditProject(project.id);
                        }}
                        className="rounded-md bg-surface-100 p-1.5 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
                        title="Edit project"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigation
                          confirmDeleteProject(project.id);
                        }}
                        className="rounded-md bg-red-100 p-1.5 text-red-700 hover:bg-red-200 
                          dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        title="Delete project"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="mb-3 text-sm text-surface-600 dark:text-surface-400">
                      {project.description}
                    </p>
                  )}
                  
                  {/* Project Progress Bar */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium">Progress</span>
                      <span className="text-xs font-medium">
                        {taskCount > 0 
                          ? `${Math.round((completedCount / taskCount) * 100)}%` 
                          : '0%'}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: taskCount > 0 ? `${(completedCount / taskCount) * 100}%` : '0%',
                          backgroundColor: taskCount === 0 
                            ? '#9ca3af' 
                            : (completedCount / taskCount) < 0.3 ? '#ef4444' 
                            : (completedCount / taskCount) < 0.7 ? '#f59e0b' 
                            : '#10b981'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center" title="Tasks">
                        <ListIcon className="mr-1 h-3.5 w-3.5 text-surface-500" />
                        <span>
                          {taskCount} tasks ({completedCount} completed)
                        </span>
                      </div>
                      
                      <div className="flex items-center" title="Total time">
                        <ClockIcon className="mr-1 h-3.5 w-3.5 text-surface-500" />
                        <span>{formatDuration(totalTime)}</span>
                      </div>
                    </div>
                    
                    <div className="text-surface-500 dark:text-surface-400">
                      Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && projectToDelete && (
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
                Are you sure you want to delete this project? This will not delete the tasks associated with this project, but they will no longer be associated with it.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setProjectToDelete(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProject(projectToDelete)}
                  className="btn bg-red-500 text-white hover:bg-red-600"
                >
                  Delete Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;