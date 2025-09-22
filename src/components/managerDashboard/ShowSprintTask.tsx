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
  Users,
  Table,
  LayoutGrid,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { colors } from "@/colors";

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
  const [taskView, setTaskView] = useState<'table' | 'kanban'>('table');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  const fetchSprintTasks = async () => {
    if (!sprintId) {
      setError('Sprint ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/tasks/sprint/${sprintId}`);
      const tasksData = Array.isArray(response.data) ? response.data : [];
      setTasks(tasksData);

      if (tasksData.length > 0 && tasksData[0].sprint) {
        setSprint(tasksData[0].sprint);
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || 
        'Failed to load sprint tasks. Please try again.'
      );
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaskDetails = async (taskId: number) => {
    setModalLoading(true);
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}`);
      setSelectedTask(response.data);
    } catch (error: any) {
      const taskFromList = tasks.find(task => task.id === taskId);
      setSelectedTask(taskFromList || null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewReport = async (task: TaskResponse) => {
    setIsModalOpen(true);
    await fetchTaskDetails(task.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchSprintTasks();
    setRefreshing(false);
  };

  const getAssigneeAvatar = (task: TaskResponse) => {
    const assignee = task.taskFor || task.user;
    if (!assignee) return null;
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-semibold">
        {assignee.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  useEffect(() => {
    if (sprintId) {
      fetchSprintTasks();
    }
  }, [sprintId]);

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
          <div className="space-y-6">
            {/* View toggle buttons */}
            <div className="flex justify-end">
              <div
                className="flex border border-white/20 rounded-full p-1 gap-1 shadow-inner"
                style={{ background: "#0000004D" }}
              >
                <button
                  onClick={() => setTaskView("table")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${
                    taskView === "table"
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/90 hover:text-white hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <Table className="w-4 h-4" /> Table View
                </button>
                <button
                  onClick={() => setTaskView("kanban")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${
                    taskView === "kanban"
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/90 hover:text-white hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" /> Kanban Board
                </button>
              </div>
            </div>

            {taskView === "table" ? (
              <div className="space-y-6">
                {/* Active Tasks Table */}
                <div className="rounded-2xl border border-white/10 backdrop-blur-xl" style={{ background: "#0000004D" }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-white/70 text-sm border-b border-white/10">
                          <th className="px-6 py-3 text-left font-medium">
                            <div className="flex items-center gap-2 text-white">
                              <ChevronDown className="w-4 h-4 text-white/80" />
                              <span className="font-semibold">Active tasks</span>
                              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-white/10 text-white/80">
                                {tasks.filter(task => task.status?.toLowerCase() === 'inprogress').length}
                              </span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-white text-left font-medium">Status</th>
                          <th className="px-6 py-3 text-left font-medium">Type</th>
                          <th className="px-6 py-3 text-left font-medium">Due Date</th>
                          <th className="px-6 py-3 text-left font-medium">Priority</th>
                          <th className="px-6 py-3 text-left font-medium">Assignee</th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent">
                        {tasks
                          .filter((task) => task.status?.toLowerCase() === 'inprogress')
                          .map((task) => (
                            <tr
                              key={task.id}
                              className="text-white text-sm border-b border-white/10 last:border-b-0 cursor-pointer hover:bg-white/5"
                              onClick={() => handleViewReport(task)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {task.title}
                                <span className="ml-2 text-white/50 text-xs">#{task.id}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-white"></span>
                                  In Progress
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                  <span>{task.description ? "Task" : "—"}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                <span className="inline-flex items-center gap-2">
                                  <ChevronDown
                                    className={`w-4 h-4 ${
                                      task.priority?.toLowerCase() === "high"
                                        ? "text-red-400"
                                        : task.priority?.toLowerCase() === "medium"
                                        ? "text-yellow-300"
                                        : "text-emerald-400"
                                    }`}
                                  />
                                  <span className="capitalize">{task.priority || "Low"}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                                    {getAssigneeAvatar(task)}
                                  </span>
                                  <span className="text-white/80 text-sm font-medium">
                                    {task.taskFor?.name || task.user?.name || "Unassigned"}
                                  </span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        {tasks.filter((task) => task.status?.toLowerCase() === 'inprogress').length === 0 && (
                          <tr>
                            <td className="px-6 py-4 text-white/60 text-sm" colSpan={6}>
                              No active tasks
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
  
                </div>

                {/* Completed Tasks Table */}
                <div className="rounded-2xl border border-white/10 backdrop-blur-xl" style={{ background: "#0000004D" }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-white/70 text-sm border-b border-white/10">
                          <th className="px-6 py-3 text-left font-medium">
                            <div className="flex items-center gap-2 text-white">
                              <ChevronDown className="w-4 h-4 text-white/80" />
                              <span className="font-semibold">Completed Task</span>
                              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-white/10 text-white/80">
                                {tasks.filter(task => task.status?.toLowerCase() === 'completed').length}
                              </span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-white text-left font-medium">Status</th>
                          <th className="px-6 py-3 text-left font-medium">Type</th>
                          <th className="px-6 py-3 text-left font-medium">Due Date</th>
                          <th className="px-6 py-3 text-left font-medium">Priority</th>
                          <th className="px-6 py-3 text-left font-medium">Assignee</th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent">
                        {tasks
                          .filter((task) => task.status?.toLowerCase() === 'completed')
                          .map((task) => (
                            <tr
                              key={task.id}
                              className="text-white text-sm border-b border-white/10 last:border-b-0 cursor-pointer hover:bg-white/5"
                              onClick={() => handleViewReport(task)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {task.title}
                                <span className="ml-2 text-white/50 text-xs">#{task.id}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  Completed
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                  <span>{task.description ? "Task" : "—"}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                <span className="inline-flex items-center gap-2">
                                  <ChevronDown
                                    className={`w-4 h-4 ${
                                      task.priority?.toLowerCase() === "high"
                                        ? "text-red-400"
                                        : task.priority?.toLowerCase() === "medium"
                                        ? "text-yellow-300"
                                        : "text-emerald-400"
                                    }`}
                                  />
                                  <span className="capitalize">{task.priority || "Low"}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                                    {getAssigneeAvatar(task)}
                                  </span>
                                  <span className="text-white/80 text-sm font-medium">
                                    {task.taskFor?.name || task.user?.name || "Unassigned"}
                                  </span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        {tasks.filter((task) => task.status?.toLowerCase() === 'completed').length === 0 && (
                          <tr>
                            <td className="px-6 py-4 text-white/60 text-sm" colSpan={6}>
                              No completed tasks
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* Kanban board view */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { key: "todo", title: "To Do", color: "gray-400" },
                  { key: "inprogress", title: "In Progress", color: "blue-400" },
                  { key: "completed", title: "Completed", color: "emerald-400" },
                  { key: "cancelled", title: "Cancelled", color: "red-400" }
                ].map(column => {
                  const columnTasks = tasks.filter(task => 
                    task.status?.toLowerCase() === column.key.toLowerCase()
                  );
                  return (
                    <div key={column.key} className="flex flex-col bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/10">
                      {/* Column Header */}
                      <div className="flex items-center justify-between p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${column.color}`}></div>
                          <span className="text-white font-medium">{column.title}</span>
                          <span className="bg-white/10 text-white text-sm px-2 py-1 rounded-full">
                            ({columnTasks.length})
                          </span>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-4 flex-1">
                        {columnTasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                            onClick={() => handleViewReport(task)}
                          >
                            {/* Task ID */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-400 text-sm font-medium">
                                #{task.id}
                              </span>
                              <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                                {getAssigneeAvatar(task)}
                              </span>
                            </div>

                            {/* Task Title */}
                            <h3 className="text-white font-medium mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors">
                              {task.title}
                            </h3>

                            {/* Priority */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="inline-flex items-center gap-2">
                                <ChevronDown
                                  className={`w-4 h-4 ${
                                    task.priority?.toLowerCase() === "high"
                                      ? "text-red-400"
                                      : task.priority?.toLowerCase() === "medium"
                                      ? "text-yellow-300"
                                      : "text-emerald-400"
                                  }`}
                                />
                                <span className="capitalize text-white/70 text-sm">{task.priority || "Low"}</span>
                              </span>
                            </div>

                            {/* Assignee & Due Date */}
                            <div className="flex items-center justify-between text-gray-400 text-sm">
                              <span className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                <span>{task.taskFor?.name || task.user?.name || "Unassigned"}</span>
                              </span>
                              {task.dueDate && (
                                <span className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Empty State */}
                        {columnTasks.length === 0 && (
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
          </div>
        )}

        {/* Task Details Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Task Report
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedTask?.title || 'Loading...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-black/30 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 bg-black/30">
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
                              {new Date(selectedTask.createdAt).toLocaleDateString()}
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
                        <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center mx-auto mb-4">
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
                  className="px-6 py-2 bg-black/30 text-gray-700 rounded-lg font-medium transition-colors"
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
