"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Plus, Users, CheckCircle, Circle, Eye } from 'lucide-react';
import { AssignTaskModal } from '../../adminDashboard/AssignProjectTicket';
import type { Task } from '@/types';
import { colors } from "@/colors";
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

type Sprint = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
  progress?: number;
};

type SprintsTabProps = {
  projectId: number;
  projectName: string;
};

const SprintsTab: React.FC<SprintsTabProps> = ({ projectId, projectName }) => {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [selectedSprintName, setSelectedSprintName] = useState<string>('');

  // Task state for the modal
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

  // Helper function to get user status icon
  const getUserStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-3 h-3" style={{ color: colors.primary.hex }} />;
      case 'busy':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'offline':
        return <Circle className="w-3 h-3 text-gray-400" />;
      default:
        return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  // Helper function to generate project prefix for ticket numbers
  const getProjectPrefix = (name: string) => {
    return name.slice(0, 3).toUpperCase();
  };

  // Fetch sprints for the specific project
  useEffect(() => {
    const fetchSprints = async () => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const { data } = await axiosInstance.get(`/sprint/project/${projectId}`);
        setSprints(data);
      } catch (err) {
        setError('Failed to load sprints.');
        setSprints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSprints();
  }, [projectId]);

  // Handle sprint card click - navigate to sprint tasks page
  const handleSprintClick = (sprint: Sprint) => {
    const sprintName = encodeURIComponent(sprint.name);
    const projName = encodeURIComponent(projectName);
    router.push(`/dashboard/manager/showSprinttasks/${sprint.id}?name=${sprintName}&projectId=${projectId}&projectName=${projName}`);
  };

  // Handle add task button click
  const handleAddTask = (sprint: Sprint) => {
    setSelectedSprintId(sprint.id);
    setSelectedSprintName(sprint.name);
    setIsModalOpen(true);

    // Generate ticket prefix from project name
    const prefix = getProjectPrefix(projectName);

    // Reset task state with prefix
    setTask({
      id: '',
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

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSprintId(null);
    setSelectedSprintName('');

    // Update URL to sprints tab without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'sprints');
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Handle task creation success
  const handleTaskAdd = () => {
    console.log('Tasks created successfully for sprint:', selectedSprintId);
    // You can add additional logic here like showing a success toast
  };

  if (loading) {
    return (
      <div className="p-12 text-center border border-white/10 rounded-2xl max-w-xl w-full mx-auto" style={{ background: "#0000004D" }}>
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
          <Clock className="w-6 h-6 text-emerald-600 animate-spin" />
        </div>
        <p className="text-white/80">Loading sprints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200/40 rounded-2xl text-white max-w-xl w-full mx-auto" style={{ background: "#0000004D" }}>
        <div className="flex items-center gap-2 mb-1">
          <Circle className="w-5 h-5 text-red-300" />
          <div className="font-semibold">Error loading sprints</div>
        </div>
        <div className="text-white/80 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{projectName} Sprints</h2>
          <p className="text-white/70 mt-1">Manage and track sprints for this project</p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => router.push(`/dashboard/manager/addsprints/${projectId}`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-full transition shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 border"
            style={{
              backgroundColor: "#0CA9F6",
              border: "1px solid #57B5E7E5",
            }}
          >
            <Plus className="w-4 h-4" />
            Add Sprint
          </button>
        )}
      </div>

      {/* Sprints Grid */}
      {sprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 text-white py-12">
          <Calendar className="w-16 h-16 text-white/20" />
          <div className="text-center">
            <p className="text-lg font-medium mb-2">No sprints found</p>
            <p className="text-white/70">Create your first sprint to get started with project management.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/30 shadow-lg p-6 hover:shadow-2xl transition cursor-pointer transform hover:scale-105 group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-0">
                <h2 className="text-lg font-bold text-white">{sprint.name}</h2>
                <span
                  className="text-xs py-2.5 px-5 rounded-full font-medium text-white "
                  style={{ backgroundColor: `${colors.primary.rgb.replace(", 1)", ", 1)")}` }}
                >
                  Active
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-5 line-clamp-2 ">
                {sprint.description || "No description provided"}
              </p>

              {/* Details */}
              <div className="space-y-2 text-sm text-gray-300 mb-5">
                <div className="flex justify-between">
                  <span className="font-medium ">Timeline</span>
                  <span className="text-white">
                    {sprint.startDate && new Date(sprint.startDate).toLocaleDateString()} -{" "}
                    {sprint.endDate && new Date(sprint.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium ">Progress</span>
                  <span className="text-white">{Math.round(sprint.progress || 0)}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-700/40 rounded-full h-2 mb-5">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${sprint.progress}%`, backgroundColor: colors.primary.hex }}
                ></div>
              </div>

              {/* Footer (actions & users) */}
              <div>
                {/* View Button - full width, matches progress bar */}
                <button
                  onClick={() => handleSprintClick(sprint)}
                  className="flex min-h-9 items-center justify-center w-full gap-2 py-3 rounded-full hover:opacity-80 transition text-xs font-medium bg-black/30 text-white "

                  title="View all tasks in this sprint"
                >
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Task Modal */}
      {typeof selectedSprintId === 'number' && (
        <AssignTaskModal
          open={isModalOpen}
          onClose={handleModalClose}
          onAdd={handleTaskAdd}
          task={task}
          setTask={setTask}
          getUserStatusIcon={getUserStatusIcon}
          projectId={projectId}
          sprintId={selectedSprintId}
        />
      )}
    </div>
  );
};

export default SprintsTab;