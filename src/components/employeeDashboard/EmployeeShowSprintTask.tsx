"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import TaskDetailsPanel from '../managerDashboard/TaskDetailScreen';
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
  ChevronDown,
  Filter
} from 'lucide-react';
import { colors } from "@/colors";
import Image from 'next/image';
import { useEmployeeContext } from '@/context/EmployeeContext';

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
  taskOf?: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    logo?: string;
  };
  taskFor?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  ticketNumber?: string;
}

const EmployeeShowSprintTask: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const sprintId = params.id as string;
  const sprintName = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')!) : null;

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [taskView, setTaskView] = useState<'table' | 'kanban'>('table');
  const [projectId, setProjectId] = useState<number | null>(null);
  // Modal states
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  // const [modalLoading, setModalLoading] = useState(false);

  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const fetchSprintTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/tasks/employee/sprint/${sprintId}`);
      setTasks(Array.isArray(data) ? data : []);
      setProjectId(data[0].taskOf.id);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load sprint tasks.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };
  const { activeTab, setActiveTab } = useEmployeeContext()

  // const fetchTaskDetails = async (taskId: number) => {
  //   setModalLoading(true);
  //   try {
  //     // For employee, just find in local list (API does not provide single task endpoint for employee)
  //     const taskFromList = tasks.find(task => task.id === taskId);
  //     setSelectedTask(taskFromList || null);
  //   } finally {
  //     setModalLoading(false);
  //   }
  // };

  const handleViewReport = (task: TaskResponse) => {
    setSelectedTaskId(task.id);
    setIsTaskDetailOpen(true);
  };
  // const closeModal = () => {
  //   setIsModalOpen(false);
  //   setSelectedTask(null);
  // };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchSprintTasks();
    setRefreshing(false);
  };

  const getAssigneeAvatar = (task: TaskResponse) => {
    if (!task.taskFor?.avatar) {
      return <User className="w-4 h-4 text-white" />;
    }
    return <img src={task.taskFor.avatar} alt={task.taskFor.name} className="w-full h-full object-cover" />;
  };

  // Handle submit report button click
  const handleSubmitReport = (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation(); // Prevent row click event
    router.push(`/dashboard/teammember/submittaskreport?taskId=${taskId}&projectId=${sprintId}`);
  };

  // Handle update status button click
  const handleUpdateStatus = (e: React.MouseEvent, task: TaskResponse) => {
    e.stopPropagation(); // Prevent row click event
    // Redirect to UpdateTaskStatus page with task ID and sprint ID
    router.push(`/dashboard/teammember/updatetaskstatus?taskId=${task.id}&sprintId=${sprintId}`);
  };

  // Check if user is an employee
  const isEmployee = () => {
    return user?.role?.toLowerCase() === 'employee';
  };

  useEffect(() => {
    if (sprintId) {
      fetchSprintTasks();
    }
    // eslint-disable-next-line
  }, [sprintId]);

  return (
    <div className="transform w-[96%]  overflow-y-auto hide-scrollbar">
      <div className="mx-auto">
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

            >
              <RefreshCw
                className={`w-4 h-4 transition-transform duration-300 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
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
          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <button className="flex items-center gap-2 text-white px-2 py-1 rounded-full transition-all focus:outline-none">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium ">Filter</span>
              </button>
              <div className="flex items-center gap-4">

                <div
                  className="flex rounded-full p-1 gap-1 shadow-inner"
                  style={{ background: "#0000004D" }}
                >
                  {[
                    { key: "sprints", label: "Sprints" },
                    { key: "calendar", label: "Calendar" },
                    { key: "members", label: "Members" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        setActiveTab(t.key as any)
                        const url = new URL(window.location.href)
                        url.searchParams.set("tab", t.key)
                        router.replace(url.pathname + url.search)
                        router.push(`/dashboard/teammember/projects/${projectId}?tab=${t.key}`);
                      }}
                      className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${activeTab === (t.key as any)
                        ? "bg-[#0000004D] text-white shadow "
                        : "text-white/80 hover:text-white hover:bg-white/10 "
                        }`}
                      style={{ minWidth: 90 }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Sprint name and view toggle buttons in one row */}
            <div className="flex items-center justify-between w-full mb-4">
              {/* Sprint Name at left */}
              {sprintName ? (
                <span className="text-[20px] font-[600px] text-white  px-4 py-2 " style={{ minWidth: '180px' }}>
                  {sprintName}
                </span>
              ) : <span />}
              <div
                className="flex  rounded-full p-1 gap-1 shadow-inner"
                style={{ background: "#0000004D" }}
              >
                <button
                  onClick={() => setTaskView("table")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${taskView === "table"
                    ? "bg-white/10 text-white  "
                    : "text-white/90 hover:text-white hover:bg-white/10 "
                    }`}
                >
                  <Table className="w-4 h-4" /> Table View
                </button>
                <button
                  onClick={() => setTaskView("kanban")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${taskView === "kanban"
                    ? "bg-white/10 text-white "
                    : "text-white/90 hover:text-white hover:bg-white/10 "
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" /> Kanban Board
                </button>
              </div>
            </div>

            {/* Table View */}
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
                          <th className="px-6 py-3 text-left font-medium">Actions</th>
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
                                    className={`w-4 h-4 ${task.priority?.toLowerCase() === "high"
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
                                    {task.taskFor?.name || "Unassigned"}
                                  </span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                {isEmployee() && (
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={(e) => handleSubmitReport(e, task.id)}
                                      className="px-3 text-xs bg-gradient-to-r border border-white/20 text-white font-medium transition-all duration-200 flex items-center gap-1 py-3 bg-black/30 rounded-2xl"
                                    >
                                      <Image src="/images/submit.svg" alt="Submit Report" className="w-7 h-7 border border-white/20 p-2 rounded-full" height={20} width={20} />
                                      Submit Report
                                    </button>
                                    <button
                                      onClick={(e) => handleUpdateStatus(e, task)}
                                      className="px-3 py-1.5 text-xs bg-black/40 hover:bg-black/60 text-white font-medium border border-white/20 transition-all duration-200 flex items-center gap-1 rounded-2xl"
                                    >
                                      <Image src="/images/update.svg" alt="Update Status" className="w-7 h-7 border border-white/20 p-2 rounded-full" height={20} width={20} />
                                      Update Status
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        {tasks.filter((task) => task.status?.toLowerCase() === 'inprogress').length === 0 && (
                          <tr>
                            <td className="px-6 py-4 text-white/60 text-sm" colSpan={7}>
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
                                    className={`w-4 h-4 ${task.priority?.toLowerCase() === "high"
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
                                    {task.taskFor?.name || "Unassigned"}
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
              <div className="flex gap-6 px-18 pb-6">
                {[{ key: "inprogress", title: "In Progress", color: "white" },
                { key: "completed", title: "Completed", color: "white" },
                { key: "cancelled", title: "Cancelled", color: "white" }].map((column, idx) => {
                  const columnTasks = tasks.filter(task => task.status?.toLowerCase() === column.key);
                  return (
                    <div key={column.key} className="flex-1 min-w-[260px] rounded-2xl border border-white/10 backdrop-blur-xl p-4 flex flex-col" style={{ background: '#0000004D', boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)' }}>
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-white"></span>
                        <span className="text-white/90 font-semibold text-base">{column.title}</span>
                        <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs bg-white/10 text-white/80 font-bold">{columnTasks.length}</span>
                      </div>
                      <div className="border-b border-white/20 mb-4"></div>
                      {/* Tasks */}
                      <div className="flex-1 flex flex-col gap-4">
                        {columnTasks.length > 0 ? columnTasks.map((task) => (
                          <div key={task.id} className="rounded-xl border border-white/10 shadow-md p-4 text-white/90 transition-all duration-200 cursor-pointer min-h-[150px] flex flex-col justify-center gap-4" style={{ background: '#0000004D' }} onClick={() => handleViewReport(task)}>
                            {/* Task Header */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-blue-300">{`${task.id}`}</span>
                              <span className="text-[10px] px-2 py-1 rounded-full text-white font-bold"
                                style={{
                                  backgroundColor:
                                    task.priority?.toLowerCase() === 'high' ? '#BD4242' :
                                      task.priority?.toLowerCase() === 'medium' ? '#EAB308' :
                                        task.priority?.toLowerCase() === 'low' ? '#34D399' : 'transparent'
                                }}>
                                {task.priority?.toLowerCase() === 'high'
                                  ? 'High'
                                  : task.priority?.toLowerCase() === 'medium'
                                    ? 'Medium'
                                    : task.priority?.toLowerCase() === 'low'
                                      ? 'Low'
                                      : ''}
                              </span>
                            </div>
                            {/* Title */}
                            <div className="font-semibold text-base mb-1">{task.title}</div>
                            {/* Description */}
                            <div className="text-xs text-white/70 mb-2">{task.description || 'No description'}</div>

                            {/* Assignee & Time */}
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                                {getAssigneeAvatar(task)}
                              </span>
                              <span className="text-xs text-white/80 font-medium">{task.taskFor?.name || 'Unassigned'}</span>
                              {/* Time (example static) */}
                              <span className="flex items-center gap-1 text-xs text-white/60 ml-auto">
                                <Clock className="w-4 h-4" />
                                0h 52m
                              </span>
                            </div>
                          </div>
                        )) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-white/40 py-8">
                            <ClipboardList className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-sm">No tasks</span>
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
        {/* Task Details Panel Modal */}
        {isTaskDetailOpen && selectedTaskId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
              <TaskDetailsPanel
                taskId={selectedTaskId}
                userRole="employee"
                onClose={() => {
                  setIsTaskDetailOpen(false);
                  setSelectedTaskId(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeShowSprintTask;
