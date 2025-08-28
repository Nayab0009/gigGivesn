  'use client';
import React, { useEffect, useState } from 'react';
import { getSprintsForManagers } from '@/lib/SprintService';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, Plus, Users, CheckCircle, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AssignTaskModal } from '../adminDashboard/AssignProjectTicket';
import type { Task } from '@/types';
import { colors } from "@/colors"
import axiosInstance from '@/lib/axios';

const ManagerSprintsCards: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  
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

  // Fetch projects for manager on mount
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      setError(null);
      setSelectedProject(null);
      setSprints([]);
      import('@/lib/SprintService').then(({ getProjectsForManagers }) => {
        getProjectsForManagers(String(user.id))
          .then((data) => setProjects(data))
          .catch((err) => {
            setError('Failed to load projects.');
            setProjects([]);
          })
          .finally(() => setLoading(false));
      });
    }
  }, [user?.id]);

  // Fetch sprints for selected project
  const handleProjectClick = async (project: any) => {
    setSelectedProject(project);
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/sprint/project/${project.id}`);
      setSprints(data);
    } catch (err) {
      setError('Failed to load sprints.');
      setSprints([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle sprint card click - navigate to sprint tasks page
  const handleSprintClick = (sprint: any) => {
    const sprintName = encodeURIComponent(sprint.name);
    router.push(`/dashboard/manager/showSprinttasks/${sprint.id}?name=${sprintName}`);
  };

  // Handle add task button click
  const handleAddTask = (sprint: any) => {
    setSelectedSprintId(sprint.id);
    setSelectedSprintName(sprint.name);
    setIsModalOpen(true);
    
    // Reset task state
    setTask({
      id: '',
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Show projects if no project is selected
  if (!selectedProject) {
    if (projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4">
          <p>No projects found.</p>
        </div>
      );
    }
    return (
      <div>
        <div className="flex justify-end mb-6">
          <button
            onClick={() => router.push('/dashboard/manager/addsprints')}
            className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-xl transition shadow-sm"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
            }}
          >
            <Plus className="w-4 h-4" />
            Add Sprint
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-xl transition cursor-pointer transform hover:scale-105 group"
              style={{ borderColor: colors.primary.hex, borderWidth: 1, borderStyle: 'solid' }}
              onClick={() => handleProjectClick(project)}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold transition" style={{ color: colors.primary.hex }}>
                  {project.name}
                </h2>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Users className="w-5 h-5" style={{ color: colors.primary.hex }} />
                </div>
              </div>
              <p className="mb-4 line-clamp-3" style={{ color: colors.secondary.hex }}>
                {project.description}
              </p>
              <div className="flex items-center gap-4 text-sm mb-4" style={{ color: colors.secondary.hex }}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" style={{ color: colors.primary.hex }} />
                  {project.startDate && new Date(project.startDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" style={{ color: colors.primary.hex }} />
                  {project.endDate && new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show sprints for selected project
  return (
    <div>
      <button
        onClick={() => {
          setSelectedProject(null);
          setSprints([]);
        }}
        className="mb-6 px-4 py-2 rounded-xl text-white font-medium"
        style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})` }}
      >
        Back to Projects
      </button>
      <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary.hex }}>{selectedProject.name} Sprints</h2>
      {sprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <p>No sprints found for this project.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-xl transition cursor-pointer transform hover:scale-105 group"
              style={{ borderColor: colors.primary.hex, borderWidth: 1, borderStyle: 'solid' }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold transition" style={{ color: colors.primary.hex }}>
                  {sprint.name}
                </h2>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Users className="w-5 h-5" style={{ color: colors.primary.hex }} />
                </div>
              </div>
              <p className="mb-4 line-clamp-3" style={{ color: colors.secondary.hex }}>
                {sprint.description}
              </p>
              <div className="flex items-center gap-4 text-sm mb-4" style={{ color: colors.secondary.hex }}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" style={{ color: colors.primary.hex }} />
                  {sprint.startDate && new Date(sprint.startDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" style={{ color: colors.primary.hex }} />
                  {sprint.endDate && new Date(sprint.endDate).toLocaleDateString()}
                </span>
              </div>
              {sprint.project && (
                <div className="mt-2 text-sm font-semibold inline-block px-3 py-1 rounded-full" style={{ color: colors.primary.hex, background: colors.accent.hex }}>
                  Project: {sprint.project.name}
                </div>
              )}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTask(sprint);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-xl transition shadow-sm"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
                <button
                  onClick={() => handleSprintClick(sprint)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-xl transition shadow-sm"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                  }}
                >
                  <Users className="w-4 h-4" />
                  View Tasks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Assign Task Modal for sprints */}
      {typeof selectedSprintId === 'number' && (
        <AssignTaskModal
          open={isModalOpen}
          onClose={handleModalClose}
          onAdd={handleTaskAdd}
          task={task}
          setTask={setTask}
          getUserStatusIcon={getUserStatusIcon}
          projectId={selectedProject.id}
          sprintId={selectedSprintId}
        />
      )}
    </div>
  );
};

export default ManagerSprintsCards;