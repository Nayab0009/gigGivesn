'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Calendar,
  FileText,
  AlertTriangle,
  User,
  Star,
  ArrowLeft,
  ClipboardList,
  TrendingUp,
  Send,
  X,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { colors } from "@/colors";

// Interface for task response from backend
interface TaskResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  comment?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  taskOf?: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  sprint?: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  taskFor?: {
    id: number;
    name: string;
    role: string;
  } | null;
}

const ShowSprintTask: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sprintId = params.id as string;
  const sprintName = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')!) : null;
  
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [sprint, setSprint] = useState<TaskResponse['sprint'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Fetch tasks for the specific sprint
  const fetchSprintTasks = async () => {
    if (!sprintId) {
      setError('Sprint ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching tasks for sprint:', sprintId);
      
      const response = await axiosInstance.get(`/tasks/sprint/${sprintId}`);
      console.log('Sprint Tasks API Response:', response.data);
      
      const tasksData = Array.isArray(response.data) ? response.data : [];
      setTasks(tasksData);

      // Extract sprint info from first task if available
      if (tasksData.length > 0 && tasksData[0].sprint) {
        setSprint(tasksData[0].sprint);
      }

    } catch (error: any) {
      console.error('Error fetching sprint tasks:', error);
      setError(
        error.response?.data?.message || 
        'Failed to load sprint tasks. Please try again.'
      );
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch individual task details for modal
  const fetchTaskDetails = async (taskId: number) => {
    setModalLoading(true);
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}`);
      console.log('Task Details API Response:', response.data);
      setSelectedTask(response.data);
    } catch (error: any) {
      console.error('Error fetching task details:', error);
      // If API call fails, use the task from the list
      const taskFromList = tasks.find(task => task.id === taskId);
      setSelectedTask(taskFromList || null);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle View Report button click
  const handleViewReport = async (task: TaskResponse) => {
    setIsModalOpen(true);
    await fetchTaskDetails(task.id);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchSprintTasks();
    setRefreshing(false);
  };

  // Get status color and icon
  const getStatusInfo = (status: string | undefined | null) => {
    if (!status) {
      return {
        color: '',
        icon: <Clock className="w-5 h-5" style={{ color: colors.primary.hex }} />,
        bgColor: '',
        borderColor: '',
        glowColor: ''
      };
    }
    
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          color: '',
          icon: <CheckCircle className="w-5 h-5" style={{ color: colors.primary.hex }} />,
          bgColor: '',
          borderColor: '',
          glowColor: ''
        };
      case 'inprogress':
        return {
          color: '',
          icon: <Clock className="w-5 h-5" style={{ color: colors.primary.hex }} />,
          bgColor: '',
          borderColor: '',
          glowColor: ''
        };
      case 'cancelled':
        return {
          color: '',
          icon: <AlertTriangle className="w-5 h-5 text-red-700" />,
          bgColor: '',
          borderColor: '',
          glowColor: ''
        };
      default:
        return {
          color: '',
          icon: <Clock className="w-5 h-5" style={{ color: colors.primary.hex }} />,
          bgColor: '',
          borderColor: '',
          glowColor: ''
        };
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string | undefined | null) => {
    if (!priority) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Get task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status?.toLowerCase() === 'completed').length;
    const inProgress = tasks.filter(task => task.status?.toLowerCase() === 'inprogress').length;
    const cancelled = tasks.filter(task => task.status?.toLowerCase() === 'cancelled').length;
    
    return { total, completed, inProgress, cancelled };
  };

  // Initial data fetch
  useEffect(() => {
    if (sprintId) {
      fetchSprintTasks();
    }
  }, [sprintId]);

  const taskStats = getTaskStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 rounded-2xl font-semibold transition-all duration-300 hover:bg-white hover:shadow-lg transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing || isLoading}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-emerald-700 rounded-2xl text-sm font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/30"
            >
              <RefreshCw className={`w-5 h-5 transition-transform duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              Refresh Tasks
            </button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.primary.hex }}>
              {sprintName || `Sprint ${sprintId}`}
            </h1>
            <div className="w-24 h-1 mx-auto rounded-full mb-6" style={{ background: colors.primary.hex }}></div>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.primary.hex }}>
              {sprint?.description || 'Sprint tasks and progress overview'}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8  rounded-3xl shadow-2xl p-8 text-white"  style={{
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
          }}>
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <ClipboardList className="w-6 h-6" style={{ color: colors.primary.hex }} />
                </div>
                <div>
                  <p className="text-sm text-emerald-100">Total Tasks</p>
                  <p className="font-bold text-lg">{taskStats.total}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6" style={{ color: colors.primary.hex }} />
                </div>
                <div>
                  <p className="text-sm text-emerald-100">Completed</p>
                  <p className="font-bold text-lg">{taskStats.completed}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-6 h-6" style={{ color: colors.primary.hex }} />
                </div>
                <div>
                  <p className="text-sm text-emerald-100">In Progress</p>
                  <p className="font-bold text-lg">{taskStats.inProgress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-red-700 font-semibold text-lg">Error loading tasks</p>
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: colors.accent.hex }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary.hex }} />
              </div>
              <p className="text-slate-600 text-xl font-medium">Loading sprint tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg" style={{ background: colors.accent.hex }}>
                <ClipboardList className="w-10 h-10" style={{ color: colors.primary.hex }} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Tasks Found</h3>
              <p className="text-slate-500 text-lg">This sprint doesn't have any tasks assigned yet.</p>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => {
                  const statusInfo = getStatusInfo(task.status);
                  
                  return (
                    <div
                      key={task.id}
                      className={`${statusInfo.bgColor} rounded-2xl border-2 ${statusInfo.borderColor} p-6 hover:shadow-2xl ${statusInfo.glowColor} transition-all duration-500 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2 group`}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-3 line-clamp-2">
                            <span style={{ color: colors.primary.hex }}>{task.title}</span>
                          </h3>
                          <div className="flex items-center space-x-3">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color} shadow-lg`}>
                              {statusInfo.icon}
                              <span style={{ color: colors.primary.hex }}>{task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : ''}</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getPriorityColor(task.priority)}`}>
                              <Star className="w-4 h-4" style={{ color: colors.primary.hex }} />
                              {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Task Description */}
                      <div className="mb-6">
                        <p className="text-slate-600 line-clamp-3 leading-relaxed">
                          {task.description || 'No description provided'}
                        </p>
                      </div>

                      {/* Assignee Info */}
                      {task.taskFor ? (
                        <div className="mb-6 p-4 bg-slate-50/50 rounded-xl">
                          <div className="flex items-center space-x-3 mb-3">
                            <User className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            <span className="text-sm font-semibold" style={{ color: colors.primary.hex }}>Assigned To</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: colors.accent.hex }}>
                              <span style={{ color: colors.primary.hex }} className="text-sm font-semibold">
                                {task.taskFor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: colors.primary.hex }}>{task.taskFor.name}</p>
                              <p className="text-xs" style={{ color: colors.secondary.hex }}>{task.taskFor.role}</p>
                            </div>
                          </div>
                        </div>
                      ) : task.user ? (
                        <div className="mb-6 p-4 bg-slate-50/50 rounded-xl">
                          <div className="flex items-center space-x-3 mb-3">
                            <User className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            <span className="text-sm font-semibold" style={{ color: colors.primary.hex }}>Assigned To</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: colors.accent.hex }}>
                              <span style={{ color: colors.primary.hex }} className="text-sm font-semibold">
                                {task.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: colors.primary.hex }}>{task.user.name}</p>
                              <p className="text-xs" style={{ color: colors.secondary.hex }}>{task.user.role}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 bg-slate-50/50 rounded-xl">
                          <div className="flex items-center space-x-3 mb-3">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-500">Assignment</span>
                          </div>
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-slate-500">?</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500">No assignee</p>
                              <p className="text-xs text-slate-400">Task not yet assigned</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Task Meta Info */}
                      <div className="space-y-3 mb-6 p-4 bg-slate-50/50 rounded-xl">
                        <div className="flex items-center space-x-3 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" style={{ color: colors.primary.hex }} />
                          <span>Created: {formatDate(task.createdAt)}</span>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center space-x-3 text-sm text-slate-600">
                            <Clock className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            <span>Due: {formatDate(task.dueDate)}</span>
                          </div>
                        )}
                        {task.updatedAt !== task.createdAt && (
                          <div className="flex items-center space-x-3 text-sm text-slate-600">
                            <Clock className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            <span>Updated: {formatDate(task.updatedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* View Report Button */}
                      <div className="mt-6">
                        <button
                          onClick={() => handleViewReport(task)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r hover:shadow-xl text-white rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                          style={{ 
                            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` 
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          View Report
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: colors.accent.hex }}>
                    <MessageSquare className="w-5 h-5" style={{ color: colors.primary.hex }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: colors.primary.hex }}>
                      Task Report
                    </h3>
                    <p className="text-sm text-slate-500">
                      {selectedTask?.title || 'Loading...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {modalLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: colors.primary.hex }} />
                    <p className="text-slate-600">Loading task report...</p>
                  </div>
                ) : (
                  <div>
                    {selectedTask?.comment ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <MessageSquare className="w-5 h-5" style={{ color: colors.primary.hex }} />
                          <span className="font-semibold" style={{ color: colors.primary.hex }}>
                            Task Comment/Report
                          </span>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {selectedTask.comment}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: colors.accent.hex }}>
                          <MessageSquare className="w-8 h-8" style={{ color: colors.primary.hex }} />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-700 mb-2">
                          No Comment Available
                        </h4>
                        <p className="text-slate-500">
                          This task doesn't have any comment or report yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowSprintTask;