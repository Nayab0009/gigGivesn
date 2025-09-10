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
  MessageSquare,
  Users
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

  // Get status info for columns
  const getColumnInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          title: 'Done',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          bgColor: 'bg-green-50',
          headerColor: 'bg-green-500',
          count: tasks.filter(task => task.status?.toLowerCase() === 'completed').length
        };
      case 'inprogress':
        return {
          title: 'In Progress',
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          bgColor: 'bg-blue-50',
          headerColor: 'bg-blue-500',
          count: tasks.filter(task => task.status?.toLowerCase() === 'inprogress').length
        };
      case 'cancelled':
        return {
          title: 'Cancelled',
          icon: <X className="w-5 h-5 text-red-500" />,
          bgColor: 'bg-red-50',
          headerColor: 'bg-red-500',
          count: tasks.filter(task => task.status?.toLowerCase() === 'cancelled').length
        };
      default:
        return {
          title: 'To Do',
          icon: <ClipboardList className="w-5 h-5 text-gray-500" />,
          bgColor: 'bg-gray-50',
          headerColor: 'bg-gray-500',
          count: tasks.filter(task => !task.status || task.status.toLowerCase() === 'todo').length
        };
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string | undefined | null) => {
    if (!priority) return null;
    
    const priorityConfig = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
      low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low' }
    };
    
    const config = priorityConfig[priority.toLowerCase() as keyof typeof priorityConfig];
    if (!config) return null;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique task statuses
  const getTasksByStatus = () => {
    const statusGroups: { [key: string]: TaskResponse[] } = {};
    const statuses = ['inprogress', 'completed'];
    
    // Initialize groups
    statuses.forEach(status => {
      statusGroups[status] = [];
    });
    
    // Group tasks by status
    tasks.forEach(task => {
      const status = task.status?.toLowerCase() || 'todo';
      if (statusGroups[status]) {
        statusGroups[status].push(task);
      } else if (status === 'cancelled' || status === 'todo') {
        // Handle other statuses
        if (!statusGroups[status]) {
          statusGroups[status] = [];
        }
        statusGroups[status].push(task);
      }
    });
    
    return statusGroups;
  };

  // Get assignee avatar
  const getAssigneeAvatar = (task: TaskResponse) => {
    const assignee = task.taskFor || task.user;
    if (!assignee) return null;
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-semibold">
        {assignee.name.charAt(0).toUpperCase()}
      </div>
    );
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
  const tasksByStatus = getTasksByStatus();

  return (
    <div className="min-h-screen relative p-4 sm:p-6 lg:p-8">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
    <button
  onClick={() => router.back()}
  className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium text-white transition-all duration-300 shadow-lg hover:opacity-90"
  style={{ backgroundColor: colors.primary.hex }}
>
  <ArrowLeft className="w-4 h-4" />
  Back
</button>
  
            </div>
           <button
  onClick={refreshData}
  disabled={refreshing || isLoading}
  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white transition-all duration-300 shadow-lg disabled:opacity-50 hover:opacity-90"
  style={{ backgroundColor: colors.primary.hex }}
>
  <RefreshCw
    className={`w-4 h-4 transition-transform duration-300 ${refreshing ? 'animate-spin' : ''}`}
  />
  Refresh
</button>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Sprint Tasks
            </h1>
            <p className="text-gray-400">
              Welcome back, Manager Oversee your assigned projects and manage your tasks effectively
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-300 font-medium">Error loading tasks</p>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
            <p className="text-gray-400">Loading sprint tasks...</p>
          </div>
        ) : (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
              const columnInfo = getColumnInfo(status);
              
              // Skip empty columns that aren't in our main statuses
              if (statusTasks.length === 0 && !['inprogress', 'completed'].includes(status)) {
                return null;
              }
              
              return (
                <div key={status} className="flex flex-col">
                  {/* Column Header */}
                  <div className="flex items-center justify-between p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${columnInfo.headerColor}`}></div>
                      <span className="text-white font-medium">{columnInfo.title}</span>
                      <span className="bg-white/10 text-white text-sm px-2 py-1 rounded-full">
                        ({statusTasks.length})
                      </span>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-4 flex-1">
                    {statusTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                        onClick={() => handleViewReport(task)}
                      >
                        {/* Task ID */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-400 text-sm font-medium">
                            MBA-{task.id}
                          </span>
                          {getAssigneeAvatar(task)}
                        </div>

                        {/* Task Title */}
                        <h3 className="text-white font-medium mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors">
                          {task.title}
                        </h3>

                        {/* Priority */}
                        {task.priority && (
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            {getPriorityBadge(task.priority)}
                          </div>
                        )}

                        {/* Assignee Info */}
                        {(task.taskFor || task.user) && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <User className="w-3 h-3" />
                            <span>{(task.taskFor || task.user)?.name}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty State */}
                    {statusTasks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Task Report
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedTask?.title || 'Loading...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {modalLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading task report...</p>
                  </div>
                ) : (
                  <div>
                    {selectedTask?.comment ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            Task Comment/Report
                          </span>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {selectedTask.comment}
                          </p>
                        </div>
                        
                        {/* Task Details */}
                        <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-blue-50 rounded-xl">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {selectedTask.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Priority</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {selectedTask.priority || 'Not set'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Created</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(selectedTask.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Assignee</p>
                            <p className="font-medium text-gray-900">
                              {(selectedTask.taskFor || selectedTask.user)?.name || 'Unassigned'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">
                          No Comment Available
                        </h4>
                        <p className="text-gray-500">
                          This task doesn't have any comment or report yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
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