"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Plus, Users, CheckCircle, Circle } from 'lucide-react';
import { AssignTaskModal } from '../../adminDashboard/AssignProjectTicket';
import type { Task } from '@/types';
import { colors } from "@/colors";
import axiosInstance from '@/lib/axios';

type Sprint = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
};

type SprintsTabProps = {
  projectId: number;
  projectName: string;
};

const SprintsTab: React.FC<SprintsTabProps> = ({ projectId, projectName }) => {
  const router = useRouter();

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
    router.push(`/dashboard/manager/showSprinttasks/${sprint.id}?name=${sprintName}`);
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
        <button
          onClick={() => router.push('/dashboard/manager/addsprints')}
          className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-full transition shadow-sm"
          style={{
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
          }}
        >
          <Plus className="w-4 h-4" />
          Add Sprint
        </button>
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg p-6 hover:shadow-2xl transition cursor-pointer transform hover:scale-105 group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">{sprint.name}</h2>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: `${colors.primary.rgb.replace(", 1)", ", 0.2)")}`, color: colors.primary.hex }}
                >
                  Active
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                {sprint.description || "No description provided"}
              </p>

              {/* Details */}
              <div className="space-y-2 text-sm text-gray-300 mb-4">
                <div className="flex justify-between">
                  <span className="font-medium text-white">Timeline:</span>
                  <span>
                    {sprint.startDate && new Date(sprint.startDate).toLocaleDateString()} -{" "}
                    {sprint.endDate && new Date(sprint.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-white">Progress:</span>
                  <span>68%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-700/40 rounded-full h-2 mb-4">
                <div
                  className="h-2 rounded-full"
                  style={{ width: "68%", backgroundColor: colors.primary.hex }}
                ></div>
              </div>

              {/* Footer (actions & users) */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <img
                    src="https://i.pravatar.cc/40?img=1"
                    alt="user"
                    className="w-8 h-8 rounded-full border-2 border-black"
                  />
                  <img
                    src="https://i.pravatar.cc/40?img=2"
                    alt="user"
                    className="w-8 h-8 rounded-full border-2 border-black"
                  />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600 text-white text-xs border-2 border-black">
                    +5
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTask(sprint);
                    }}
                    className="p-2 rounded-lg hover:opacity-80 transition"
                    style={{ backgroundColor: `${colors.primary.rgb.replace(", 1)", ", 0.2)")}`, color: colors.primary.hex }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSprintClick(sprint)}
                    className="p-2 rounded-lg hover:opacity-80 transition"
                    style={{ backgroundColor: `${colors.primary.rgb.replace(", 1)", ", 0.2)")}`, color: colors.primary.hex }}
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
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