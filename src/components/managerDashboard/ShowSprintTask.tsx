'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import TaskDetailsPanel from './TaskDetailScreen';
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
  Plus,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { colors } from "@/colors";
import { AssignTaskModal } from "../adminDashboard/AssignProjectTicket";
import type { Task } from "@/types";
import { useProjectContext } from '@/context/ProjectContext';
import { getDuration } from '@/lib/general';

interface TaskResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  taskDate?: string;
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

type ShowSprintTaskProps = {
  projectId?: number;
  projectName?: string;
};

const ShowSprintTask: React.FC<ShowSprintTaskProps> = ({ projectId: propProjectId, projectName: propProjectName }) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sprintId = params.id as string;
  const sprintName = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')!) : null;
  const scope = searchParams.get('scope') || 'manager';

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [sprint, setSprint] = useState<TaskResponse['sprint'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [taskView, setTaskView] = useState<'table' | 'kanban'>('table');
  // For Assign Task modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [selectedSprintName, setSelectedSprintName] = useState<string>('');
  const [projectId, setProjectId] = useState<number | null>(propProjectId ?? null);
  const [projectName, setProjectName] = useState<string>(propProjectName ?? '');
  const [task, setTask] = useState<Task>({
    id: '',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignedTo: [],
    dueDate: '',
    estimatedHours: 0,
  });

  // Modal states
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  // const [modalLoading, setModalLoading] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  // Fetch sprint info (projectId/projectName) even if there are no tasks
  const fetchSprintInfo = async () => {
    if (propProjectId && propProjectName) {
      setProjectId(propProjectId);
      setProjectName(propProjectName);
      return;
    }
    if (!sprintId) return;
    try {
      const response = await axiosInstance.get(`/sprint/${sprintId}`);
      const sprintData = response.data;
      if (sprintData?.project) {
        setProjectId(sprintData.project.id);
        setProjectName(sprintData.project.name);
      }
    } catch (err) {
      // fallback: leave projectId/projectName null
    }
  };
  const { activeTab, setActiveTab } = useProjectContext();

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
      // If tasks exist, prefer project info from first task
      if (tasksData.length > 0 && tasksData[0].taskOf) {
        setProjectId(tasksData[0].taskOf.id);
        setProjectName(tasksData[0].taskOf.name);
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

  // Helper: user status icon for modal
  const getUserStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-3 h-3" style={{ color: colors.primary.hex }} />;
      case 'busy':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'offline':
        return <span className="inline-block w-3 h-3 rounded-full bg-gray-400" />;
      default:
        return <span className="inline-block w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  // Helper: generate project prefix for ticket numbers
  const getProjectPrefix = (name: string) => name?.slice(0, 3).toUpperCase();

  // Open Assign Task modal (same behavior as in ShowSprintsTab)
  const handleAddTask = () => {
    // Fallback: try to get projectId from first task if missing
    if (!projectId && tasks.length > 0 && tasks[0].taskOf) {
      setProjectId(tasks[0].taskOf.id);
      setProjectName(tasks[0].taskOf.name);
    }
    // If still missing, show error and do not open modal
    if (!projectId) {
      setShowProjectIdError(true);
      return;
    }
    setShowProjectIdError(false);
    setSelectedSprintId(Number(sprintId));
    setSelectedSprintName(sprintName || '');
    setIsAssignModalOpen(true);

    const prefix = getProjectPrefix(projectName || 'TCK');
    setTask({
      id: '',
      // @ts-ignore – modal expects ticketNumber though it's not in Task type
      ticketNumber: prefix,
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assignedTo: [],
      dueDate: '',
      estimatedHours: 0,
    });
  };
  // UI state for projectId error
  const [showProjectIdError, setShowProjectIdError] = useState(false);

  const handleAssignClose = () => {
    setIsAssignModalOpen(false);
    setSelectedSprintId(null);
    setSelectedSprintName('');
  };

  const handleTaskAdd = async () => {
    // Refresh after successful creation
    await refreshData();
  };

  // const fetchTaskDetails = async (taskId: number) => {
  //   setModalLoading(true);
  //   try {
  //     const response = await axiosInstance.get(`/tasks/${taskId}`);
  //     setSelectedTask(response.data);
  //   } catch (error: any) {
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
      fetchSprintInfo();
      fetchSprintTasks();
    }
    // eslint-disable-next-line
  }, [sprintId]);

  // Debug log for projectId/projectName
  useEffect(() => {
    console.log('ShowSprintTask projectId:', projectId, 'projectName:', projectName);
  }, [projectId, projectName]);

  return (
    <div className="w-full relative top-[30px] max-w-full mb-5">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* <div className="flex items-center justify-between mb-6">
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
          </div> */}
          <div className="text-center mb-6">
            {/* <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Sprint Tasks
            </h1> */}
            {/* <p className="text-gray-400">
              {scope === 'employee' ? 'Browse and work on your sprint tasks' : 'Oversee your sprint and manage tasks effectively'}
            </p> */}
          </div>
        </div>

        {/* Add Task button above toggle */}
        <div className="flex flex-col items-end gap-1 mb-5">
          {showProjectIdError && (
            <div className="mb-1 text-sm text-red-400 font-semibold bg-red-900/30 px-3 py-1 rounded">
              Project ID is missing. Cannot add task. Please check sprint/project setup.
            </div>
          )}
          <div className="flex justify-between w-full">

            <div className="flex items-center gap-5">
              <button className="flex items-center gap-1 text-white/70 hover:text-white px-2 py-1 rounded-full transition-all focus:outline-none">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              <div
                className="flex  rounded-full p-1 gap-1 shadow-inner"
                style={{ background: "#0000004D" }}
              >
                {[
                  { key: "summary", label: "Summary" },
                  // { key: "tasks", label: "Tasks" },
                  { key: "sprints", label: "Sprints" },
                  { key: "calendar", label: "Calendar" },
                  { key: "members", label: "Members" },
                  // { key: "settings", label: "Settings" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {

                      setActiveTab(t.key as any);
                      const url = new URL(window.location.href);
                      url.searchParams.set('tab', t.key);
                      router.replace(url.pathname + url.search);
                      router.push(`/dashboard/manager/projects/${projectId}?tab=${t.key}`);


                    }}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${activeTab === t.key
                      ? "bg-[#0000004D] text-white shadow "
                      : "text-white/80  hover:bg-[#0000004D] border-transparent"
                      }`}
                    style={{ minWidth: 90 }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddTask}
              className="inline-flex items-center text-sm py-2.5 gap-2  px-3 text-white font-medium rounded-full transition shadow-sm bg-[#0CA9F6] text-white"

              title="Add new task to this sprint"
            >
              <Plus className="w-4 h-4" />
              Add Task
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
          <div className="space-y-6">
            {/* Sprint name and view toggle buttons in one row */}
            <div className="flex items-center justify-between w-full py-2.5 mb-5">
              {/* Sprint Name at left */}
              {sprintName ? (
                <span className="text-[20px]  text-white font-semibold   py-2 " style={{ minWidth: '180px' }}>
                  {sprintName}
                </span>
              ) : <span />}
              <div
                className="flex  rounded-full p-1 gap-1 shadow-inner bg-black/30"

              >
                <button
                  onClick={() => setTaskView("table")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${taskView === "table"
                    ? "bg-black/30 text-white"
                    : "text-white/90  hover:bg-black/30 "
                    }`}
                >
                  <Table className="w-4 h-4" /> Table View
                </button>
                <button
                  onClick={() => setTaskView("kanban")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${taskView === "kanban"
                    ? "bg-black/30 text-white"
                    : "text-white/90  hover:bg-black/30 "
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" /> Kanban Board
                </button>
              </div>
            </div>

            {taskView === "table" ? (
              <div className="space-y-6">
                {/* Sprint name moved to toggle row */}
                <div className="rounded-2xl border border-white/30 backdrop-blur-xl" style={{ background: "#0000004D" }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-white/70 text-lg border-b border-white/30 ">
                          <th className="px-6 py-3 text-left font-semibold text-white ">
                            <div className="flex items-center gap-2 text-white">
                              <ChevronDown className="w-4 h-4 " />
                              <span className="font-semibold">Active tasks</span>
                              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-black/30 text-white/80">
                                {tasks.filter(task => task.status?.toLowerCase() === 'inprogress').length}
                              </span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-white text-left font-normal">Status</th>
                          <th className="px-6 py-3 text-white text-left font-normal">Ticket No.</th>
                          <th className="px-6 py-3 text-white text-left font-normal">Due Date</th>
                          <th className="px-6 py-3 text-white text-left font-normal">Priority</th>
                          <th className="px-6 py-3 text-white text-left font-normal">Assignee</th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent">
                        {tasks
                          .filter((task) => task.status?.toLowerCase() === 'inprogress')
                          .map((task) => (
                            <tr
                              key={task.id}
                              className="text-white text-sm border-b border-white/30 last:border-b-0 cursor-pointer hover:bg-white/5"
                              onClick={() => handleViewReport(task)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {task.title}
                                <span className="ml-2 text-white/50 text-xs">#{task.id}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-white"></span>
                                  In Progress
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                  <span>{task.ticketNumber ? task.ticketNumber : "—"}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
                                {task.taskDate ? new Date(task.taskDate).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
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
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
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
                <div className="rounded-2xl border border-white/30 backdrop-blur-xl" style={{ background: "#0000004D" }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-white/70 text-lg border-b border-white/30">
                          <th className="px-6 py-3 text-left font-semibold">
                            <div className="flex items-center gap-2 text-white">
                              <ChevronDown className="w-4 h-4 text-white/80" />
                              <span className="font-semibold">Completed Task</span>
                              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-white/30 text-white/80">
                                {tasks.filter(task => task.status?.toLowerCase() === 'completed').length}
                              </span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-white text-left font-normal">Status</th>
                          <th className="px-6 py-3 text-white text-left font-normal">Type</th>
                          <th className="px-6 py-3 text-white text-left font-normal">Due Date</th>
                          <th className="px-6 py-3 text-white text-left font-normal">Priority</th>
                          <th className="px-6 py-3 text-white text-left font-normal">Assignee</th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent">
                        {tasks
                          .filter((task) => task.status?.toLowerCase() === 'completed')
                          .map((task) => (
                            <tr
                              key={task.id}
                              className="text-white text-sm border-b border-white/30 last:border-b-0 cursor-pointer hover:bg-white/5"
                              onClick={() => handleViewReport(task)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {task.title}
                                <span className="ml-2 text-white/50 text-xs">#{task.id}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  Completed
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                  <span>{task.description ? "Task" : "—"}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
                                {task.taskDate ? new Date(task.taskDate).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
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
                              <td className="px-6 py-4 whitespace-nowrap border-l border-white/30">
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
              <div className="flex gap-6 px-18 pb-6">
                {[{ key: "inprogress", title: "In Progress", color: "white" },
                { key: "completed", title: "Completed", color: "white" },
                { key: "cancelled", title: "Cancelled", color: "white" }].map((column, idx) => {
                  const columnTasks = tasks.filter(task => task.status?.toLowerCase() === column.key);
                  return (
                    <div key={column.key} className="flex-1 min-w-[260px] rounded-2xl border gap-3 border-white/30 backdrop-blur-xl p-4 flex flex-col bg-black/30">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-white"></span>
                        <span className="text-white/90 font-semibold text-base">{column.title}</span>
                        <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs bg-black/30 text-white/80 font-bold">{columnTasks.length}</span>
                      </div>
                      <div className="border-b border-white/30 mb-4"></div>
                      {/* Tasks */}
                      <div className="flex-1 flex flex-col gap-4">
                        {columnTasks.length > 0 ? columnTasks.map((task) => (
                          <div key={task.id} className="rounded-xl border border-white/30 shadow-md p-4 text-white/90 transition-all duration-200 cursor-pointer min-h-[150px] flex flex-col justify-center gap-4" style={{ background: '#0000004D' }} onClick={() => handleViewReport(task)}>
                            {/* Task Header */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[#0CA9F6]">{`${task?.ticketNumber || task.id}`}</span>
                              <span className="text-[10px] px-2 py-0 rounded-full text-white font-bold"
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
                                {getDuration(task.taskDate || '')}
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

        {/* Task Details Panel Modal */}
        {isTaskDetailOpen && selectedTaskId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
              <TaskDetailsPanel
                taskId={selectedTaskId}
                onClose={() => {
                  setIsTaskDetailOpen(false);
                  setSelectedTaskId(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Assign Task Modal */}
        {typeof selectedSprintId === 'number' && (
          <>
            {(!projectId || !projectName) ? (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2 text-gray-900">Project Info Missing</h2>
                  <p className="text-gray-700 mb-4">Project ID or name is missing. Please check your API or parent component.</p>
                  <div className="text-xs text-gray-500">projectId: {String(projectId)}, projectName: {projectName}</div>
                  <button onClick={handleAssignClose} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg">Close</button>
                </div>
              </div>
            ) : (
              <AssignTaskModal
                open={isAssignModalOpen}
                onClose={handleAssignClose}
                onAdd={handleTaskAdd}
                task={task}
                setTask={setTask}
                getUserStatusIcon={getUserStatusIcon}
                projectId={projectId}
                sprintId={selectedSprintId}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShowSprintTask;
