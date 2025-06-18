'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Check,
  X,
  Eye,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  Play,
  CheckSquare,
  ArrowLeft,
  ClipboardList,
  Users,
  TrendingUp,
  Send,
  Edit3
} from 'lucide-react';

// Interface for project (from taskOf object)
interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for task response from backend
interface TaskResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  taskFor: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  taskOf: Project;
}

// Interface for project with tasks
interface ProjectWithTasks {
  project: Project;
  tasks: TaskResponse[];
}

const EmployeeTasks = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [allTasks, setAllTasks] = useState<TaskResponse[]>([]);
  const [projectsWithTasks, setProjectsWithTasks] = useState<ProjectWithTasks[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'projects' | 'tasks'>('projects');
  
  // Modal states
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch all tasks for the current user
  const fetchUserTasks = async () => {
    if (!isAuthenticated || !user?.id) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching tasks for user:', user.id);
      
      const response = await axiosInstance.post('/tasks/user/all', {
        userId: user.id,
        projectId: 3 // You can make this dynamic if needed
      });

      console.log('Tasks API Response:', response.data);
      
      const tasksData = Array.isArray(response.data) ? response.data : [];
      setAllTasks(tasksData);

      // Group tasks by project
      const projectMap = new Map<number, ProjectWithTasks>();
      
      tasksData.forEach((task) => {
        const projectId = task.taskOf.id;
        
        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, {
            project: task.taskOf,
            tasks: []
          });
        }
        
        projectMap.get(projectId)!.tasks.push(task);
      });
      
      const projectsArray = Array.from(projectMap.values());
      setProjectsWithTasks(projectsArray);

    } catch (error: any) {
      console.error('Error fetching user tasks:', error);
      setError(
        error.response?.data?.message || 
        'Failed to load tasks. Please try again.'
      );
      setAllTasks([]);
      setProjectsWithTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle project selection
  const handleProjectSelect = (projectWithTasks: ProjectWithTasks) => {
    setSelectedProject(projectWithTasks);
    setViewMode('tasks');
  };

  // Go back to projects view
  const goBackToProjects = () => {
    setViewMode('projects');
    setSelectedProject(null);
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchUserTasks();
    setRefreshing(false);
  };

  // Modal handlers
  const handleSubmitReport = (task: TaskResponse) => {
    // Navigate to the submit report page with task data
    router.push(`/dashboard/teammember/submittaskreport?taskId=${task.id}&projectId=${task.taskOf.id}`);
  };

  const handleUpdateStatus = (task: TaskResponse) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setShowUpdateStatusModal(true);
  };

  const closeUpdateStatusModal = () => {
    setShowUpdateStatusModal(false);
    setSelectedTask(null);
    setNewStatus('');
    setUpdatingStatus(false);
  };

  const updateTaskStatus = async () => {
    if (!selectedTask || !newStatus.trim()) return;
    
    setUpdatingStatus(true);
    try {
      // PATCH API call to update task status
      const response = await axiosInstance.patch(`/tasks/${selectedTask.id}`, {
        status: newStatus
      });

      console.log('Task status updated successfully:', response.data);
      
      closeUpdateStatusModal();
      // Refresh data to show updated status
      await fetchUserTasks();
    } catch (error: any) {
      console.error('Error updating task status:', error);
      setError(
        error.response?.data?.message || 
        'Failed to update task status. Please try again.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          color: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200',
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
          borderColor: 'border-emerald-200',
          glowColor: 'shadow-emerald-100'
        };
      case 'inprogress':
        return {
          color: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-200',
          icon: <Clock className="w-5 h-5" />,
          bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
          borderColor: 'border-teal-200',
          glowColor: 'shadow-teal-100'
        };
      case 'cancelled':
        return {
          color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200',
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          glowColor: 'shadow-red-100'
        };
      default:
        return {
          color: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200',
          icon: <Clock className="w-5 h-5" />,
          bgColor: 'bg-gradient-to-br from-slate-50 to-gray-50',
          borderColor: 'border-slate-200',
          glowColor: 'shadow-slate-100'
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate project progress
  const getProjectProgress = (project: Project) => {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const today = new Date();
    
    if (today < startDate) return 0;
    if (today > endDate) return 100;
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    return Math.round((elapsed / totalDuration) * 100);
  };

  // Get task statistics for a project
  const getProjectTaskStats = (tasks: TaskResponse[]) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status.toLowerCase() === 'completed').length;
    const inProgress = tasks.filter(task => task.status.toLowerCase() === 'inprogress').length;
    const cancelled = tasks.filter(task => task.status.toLowerCase() === 'cancelled').length;
    
    return { total, completed, inProgress, cancelled };
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserTasks();
    }
  }, [isAuthenticated, user?.id]);

  // Show authentication error if user is not logged in
  if (!isAuthenticated || !user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Required</h2>
            <p className="text-slate-600 text-lg">Please log in to view your assigned projects.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent mb-4">
              {viewMode === 'projects' ? 'My Projects' : selectedProject?.project.name}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto">
              {viewMode === 'projects' ? (
                <>
                  Welcome back, <span className="font-semibold text-emerald-600">{user.name || user.email}</span>! 
                  Here are your assigned projects
                </>
              ) : (
                <>
                  Tasks for project: <span className="font-semibold text-emerald-600">{selectedProject?.project.name}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Back Button for Tasks View */}
        {viewMode === 'tasks' && (
          <div className="mb-6">
            <button
              onClick={goBackToProjects}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 rounded-2xl font-semibold transition-all duration-300 hover:bg-white hover:shadow-lg transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Projects
            </button>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  {viewMode === 'projects' ? (
                    <Building2 className="w-6 h-6 text-white" />
                  ) : (
                    <ClipboardList className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-emerald-100">
                    {viewMode === 'projects' ? 'Total Projects' : 'Total Tasks'}
                  </p>
                  <p className="font-bold text-lg">
                    {viewMode === 'projects' ? projectsWithTasks.length : selectedProject?.tasks.length || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-100">
                    {viewMode === 'projects' ? 'Total Tasks' : 'Completed'}
                  </p>
                  <p className="font-bold text-lg">
                    {viewMode === 'projects' 
                      ? allTasks.length
                      : selectedProject?.tasks.filter(task => task.status.toLowerCase() === 'completed').length || 0
                    }
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing || isLoading}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-2xl text-sm font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/30"
            >
              <RefreshCw className={`w-5 h-5 transition-transform duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              Refresh {viewMode === 'projects' ? 'Projects' : 'Tasks'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-red-700 font-semibold text-lg">Error loading {viewMode}</p>
            </div>
            <p className="text-red-600 mb-4 ml-13">{error}</p>
            <button
              onClick={refreshData}
              className="ml-13 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content Container */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-slate-600 text-xl font-medium">Loading your assigned {viewMode}...</p>
            </div>
          ) : viewMode === 'projects' ? (
            // Projects View
            projectsWithTasks.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Projects Assigned</h3>
                <p className="text-slate-500 text-lg">You don't have any projects assigned to you at the moment.</p>
              </div>
            ) : (
              <div className="p-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {projectsWithTasks.map((projectWithTasks) => {
                    const { project, tasks } = projectWithTasks;
                    const progress = getProjectProgress(project);
                    const taskStats = getProjectTaskStats(tasks);
                    
                    return (
                      <div
                        key={project.id}
                        className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl border-2 border-emerald-200 p-6 hover:shadow-2xl shadow-emerald-100 transition-all duration-500 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2 group cursor-pointer"
                        onClick={() => handleProjectSelect(projectWithTasks)}
                      >
                        {/* Project Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                              {project.name}
                            </h3>
                            <div className="flex items-center space-x-3">
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                                project.isActive 
                                  ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200' 
                                  : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200'
                              } shadow-lg`}>
                                {project.isActive ? (
                                  <TrendingUp className="w-5 h-5" />
                                ) : (
                                  <AlertCircle className="w-5 h-5" />
                                )}
                                {project.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-3 text-slate-400 hover:text-emerald-600 transition-all duration-300 rounded-xl hover:bg-white/50 transform hover:scale-110">
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Project Description */}
                        <div className="mb-6">
                          <p className="text-slate-600 line-clamp-3 leading-relaxed">
                            {project.description || 'No description provided'}
                          </p>
                        </div>

                        {/* Task Statistics */}
                        <div className="mb-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                          <div className="flex items-center space-x-3 mb-3">
                            <ClipboardList className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-bold text-slate-700">Task Overview</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                              <p className="text-lg font-bold text-emerald-600">{taskStats.total}</p>
                              <p className="text-xs text-slate-600">Total</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-blue-600">{taskStats.inProgress}</p>
                              <p className="text-xs text-slate-600">In Progress</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-600">{taskStats.completed}</p>
                              <p className="text-xs text-slate-600">Completed</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-red-600">{taskStats.cancelled}</p>
                              <p className="text-xs text-slate-600">Cancelled</p>
                            </div>
                          </div>
                        </div>

                        {/* Project Progress */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">Progress</span>
                            <span className="text-sm font-bold text-emerald-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Project Dates */}
                        <div className="mb-6 p-4 bg-slate-50/50 rounded-xl">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm text-slate-600">
                              <Calendar className="w-4 h-4 text-emerald-500" />
                              <span>Start: {formatDate(project.startDate)}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-slate-600">
                              <Calendar className="w-4 h-4 text-emerald-500" />
                              <span>End: {formatDate(project.endDate)}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-slate-600">
                              <Building2 className="w-4 h-4 text-emerald-500" />
                              <span>Project ID: #{project.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                          <ClipboardList className="w-4 h-4" />
                          View Tasks ({taskStats.total})
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            // Tasks View
            !selectedProject ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Project Selected</h3>
                <p className="text-slate-500 text-lg">Please select a project to view its tasks.</p>
              </div>
            ) : selectedProject.tasks.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Tasks Assigned</h3>
                <p className="text-slate-500 text-lg">You don't have any tasks assigned for this project.</p>
              </div>
            ) : (
              <div className="p-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {selectedProject.tasks.map((task) => {
                    const statusInfo = getStatusInfo(task.status);
                    
                    return (
                      <div
                        key={task.id}
                        className={`${statusInfo.bgColor} rounded-2xl border-2 ${statusInfo.borderColor} p-6 hover:shadow-2xl ${statusInfo.glowColor} transition-all duration-500 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2 group`}
                      >
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                              {task.title}
                            </h3>
                            <div className="flex items-center space-x-3">
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color} shadow-lg`}>
                                {statusInfo.icon}
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-3 text-slate-400 hover:text-emerald-600 transition-all duration-300 rounded-xl hover:bg-white/50 transform hover:scale-110">
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Task Description */}
                        <div className="mb-6">
                          <p className="text-slate-600 line-clamp-3 leading-relaxed">
                            {task.description || 'No description provided'}
                          </p>
                        </div>

                        {/* Task Meta Info */}
                        <div className="space-y-3 mb-6 p-4 bg-slate-50/50 rounded-xl">
                          <div className="flex items-center space-x-3 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-emerald-500" />
                            <span>Created: {formatDate(task.createdAt)}</span>
                          </div>
                          {task.updatedAt !== task.createdAt && (
                            <div className="flex items-center space-x-3 text-sm text-slate-600">
                              <Clock className="w-4 h-4 text-emerald-500" />
                              <span>Updated: {formatDate(task.updatedAt)}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-3 text-sm text-slate-600">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            <span>Task ID: #{task.id}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-3">
                          <button 
                            onClick={() => handleSubmitReport(task)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Submit Report
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(task)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            Update Status
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateStatusModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Update Task Status</h3>
              <button
                onClick={closeUpdateStatusModal}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">{selectedTask.title}</h4>
              <p className="text-sm text-slate-600 mb-4">Update the status of this task.</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeUpdateStatusModal}
                className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateTaskStatus}
                disabled={!newStatus || updatingStatus}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;