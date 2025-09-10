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
        <div className="flex items-center justify-between mb-6 mt-6">
          <div className='flex flex-col gap-3'>
          <h2 className="text-2xl font-bold text-white">Sprints</h2>
         
            <h6 className="text-white">Welcome back, asim! Oversee your assigned projects and manage your team effectively</h6>
        </div>
            <div className="flex justify-end mb-6">
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
          </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
 <div
  key={project.id}
  className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg p-8 min-h-[260px] flex flex-col justify-between hover:shadow-2xl transition cursor-pointer transform hover:scale-105 group"
  onClick={() => handleProjectClick(project)}
>
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold text-white">{project.name}</h2>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <Users className="w-5 h-5" style={{ color: colors.primary.hex }} />
    </div>
  </div>

  {/* Description */}
  <p className="text-sm text-gray-300 mb-4 line-clamp-3">
    {project.description || "No description provided."}
  </p>

  {/* Details */}
  <div className="space-y-2 text-sm text-gray-300 mb-4">
    <div className="flex justify-between">
      <span className="font-medium text-white">Start:</span>
      <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-medium text-white">End:</span>
      <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}</span>
    </div>
  </div>

 <button
  onClick={(e) => {
    e.stopPropagation(); // prevent triggering card click
    handleProjectClick(project);
  }}
  className="mt-4 inline-flex items-center justify-center px-6 py-2.5 rounded-full font-medium text-white transition-all duration-300 bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60"
>
  View Sprints
</button>

  {/* Footer line with primary blue */}
  <div
    className="mt-4 h-[2px] rounded-full"
    style={{
      background: `linear-gradient(to right, ${colors.primary.hex}, transparent)`,
    }}
  ></div>
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
        className="mb-6 px-4 py-2 rounded-full text-white font-medium"
        style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})` }}
      >
        Back to Projects
      </button>
      <h2 className="text-2xl font-bold mb-6 text-white" >{selectedProject.name} Sprints</h2>
      {sprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 text-white">
          <p>No sprints found for this project.</p>
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
    {sprint.description}
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