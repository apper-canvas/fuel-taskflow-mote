import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { projectService } from '/src/services/projectService.js';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { 
  selectProjectById, selectAllTasks, updateProject, deleteProject
} from '../store';
import { formatDuration } from '../utils/timeUtils';
import { getIcon } from '../utils/iconUtils';

// Icons
const ArrowLeftIcon = getIcon('arrow-left');
const EditIcon = getIcon('edit-3');
const TrashIcon = getIcon('trash-2');
const ClockIcon = getIcon('clock');
const ListIcon = getIcon('list');
const TagIcon = getIcon('tag');

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const projectId = parseInt(id);
  const project = useSelector(state => selectProjectById(state, projectId));
  const allTasks = useSelector(selectAllTasks);
  const projectTasks = allTasks.filter(task => task.projectId === projectId);
  
  // State for delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Handle if project not found
  if (!project) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="rounded-xl bg-white p-6 shadow-soft dark:bg-surface-800">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/projects')}
              className="mr-4 rounded-md p-2 hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold">Project Not Found</h2>
          </div>
          <p className="mt-4">The project you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/projects')}
            className="btn btn-primary mt-4"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }
  
  // Calculate project statistics
  const taskCount = projectTasks.length;
  const completedCount = projectTasks.filter(task => task.status === 'Done').length;
  const completionPercentage = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  
  // Calculate total time spent on project tasks
  let totalTime = 0;
  projectTasks.forEach(task => {
    if (task.timeEntries) {
      totalTime += task.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    }
  });
  
  // Handle project deletion
  const handleDeleteProject = () => {
    dispatch(deleteProject(projectId));
    toast.success("Project deleted successfully!");
    navigate('/projects');
  };
  
  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      <div className="mb-6 rounded-xl bg-white p-6 shadow-soft dark:bg-surface-800">
        {/* Project Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/projects')}
              className="mr-4 rounded-md p-2 hover:bg-surface-100 dark:hover:bg-surface-700"
              aria-label="Back to projects"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold" style={{ color: project.color }}>
              {project.name}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                navigate('/projects');
                setTimeout(() => {
                  const projectElement = document.getElementById(`project-${projectId}`);
                  if (projectElement) projectElement.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="btn btn-outline"
            >
    try {
      await projectService.deleteProject(id);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to delete project: ' + error.message);
    }
            <button
                setTimeout(() => {
                  // Trigger edit on the project
                  const editButton = document.querySelector(`#project-${projectId} .edit-button`);
                  if (editButton) editButton.click();
                }, 100);
              }}
              className="btn btn-outline"
              aria-label="Edit project"
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="btn bg-red-500 text-white hover:bg-red-600"
              aria-label="Delete project"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Project Description */}
        {project.description && (
          <p className="mb-6 text-surface-600 dark:text-surface-400">
            {project.description}
          </p>
        )}
        
        {/* Project Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
            <h3 className="mb-2 text-lg font-medium">Tasks</h3>
            <div className="flex items-center">
              <ListIcon className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{taskCount}</span>
              <span className="ml-2 text-surface-500">({completedCount} completed)</span>
            </div>
          </div>
          
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
            <h3 className="mb-2 text-lg font-medium">Completion</h3>
            <div className="flex items-center">
              <div className="w-full">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-2xl font-bold">{completionPercentage}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-200 dark:bg-surface-700">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${completionPercentage}%`,
                      backgroundColor: completionPercentage < 30 ? '#ef4444' : 
                                      completionPercentage < 70 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
            <h3 className="mb-2 text-lg font-medium">Time Spent</h3>
            <div className="flex items-center">
              <ClockIcon className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{formatDuration(totalTime)}</span>
            </div>
          </div>
        </div>
        
        {/* Project Tasks */}
        <div>
          <h3 className="mb-4 text-xl font-medium">Project Tasks</h3>
          
          {projectTasks.length === 0 ? (
            <p className="text-surface-500">No tasks are associated with this project yet.</p>
          ) : (
            <div className="space-y-3">
              {projectTasks.map(task => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg border p-4 transition-shadow hover:shadow-soft ${
                    task.status === 'Done'
                      ? 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10'
                      : 'border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className={`font-medium ${
                      task.status === 'Done' ? 'text-green-800 dark:text-green-400' : ''
                    }`}>
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center space-x-2">
                      {/* Status Badge */}
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        task.status === 'Todo' ? 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300' :
                        task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {task.status}
                      </span>
                      
                      {/* Priority Badge */}
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        task.priority === 'Low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        task.priority === 'Medium' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        task.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
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
                  
                  {/* Time Tracking Info */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-primary">
                      <ClockIcon className="mr-1 h-3.5 w-3.5" />
                      <span>
                        {task.timeEntries && task.timeEntries.length > 0
                          ? formatDuration(task.timeEntries.reduce((sum, entry) => sum + entry.duration, 0))
                          : 'No time tracked'}
                      </span>
                    </div>
                    <div className="text-surface-500">
                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-surface-800">
            <h3 className="mb-4 text-lg font-medium">Confirm Deletion</h3>
            <p className="mb-6 text-surface-600 dark:text-surface-300">
              Are you sure you want to delete this project? This will not delete the tasks associated with this project, but they will no longer be associated with it.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;