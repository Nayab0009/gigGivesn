'use client';
import React, { useEffect, useState } from 'react';
import { getSprintsForManagers } from '@/lib/SprintService';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, Plus, Users, CheckCircle, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AssignTaskModal } from '../adminDashboard/AssignProjectTicket';
import type { Task } from '@/types';

const ManagerSprintsCards: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [sprints, setSprints] = useState<any[]>([]);
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
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'busy':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'offline':
        return <Circle className="w-3 h-3 text-gray-400" />;
      default:
        return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  useEffect(() => {
    if (user?.id) {
      getSprintsForManagers(String(user.id))
        .then((data) => setSprints(data))
        .catch((err) => {
          console.error('Error fetching sprints:', err);
          setError('Failed to load sprints.');
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

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

  if (loading) return <p>Loading sprints...</p>;
  if (error) return <p>{error}</p>;
  if (sprints.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p>No sprints found.</p>
        <button
          onClick={() => router.push('/dashboard/manager/addsprints')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          Add Sprint
        </button>
      </div>
    );

  return (
    <div>
      {/* Top right "Add Sprint" button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => router.push('/dashboard/manager/addsprints')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Sprint
        </button>
      </div>

      {/* Sprints Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sprints.map((sprint) => (
          <div
            key={sprint.id}
            className="bg-white border border-emerald-200 rounded-2xl shadow-sm p-6 hover:shadow-xl hover:border-emerald-300 transition cursor-pointer transform hover:scale-105 group"
          >
            {/* Add visual indicator for clickability */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-emerald-700 group-hover:text-emerald-800 transition">
                {sprint.name}
              </h2>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-3">
              {sprint.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-emerald-500" />
                {new Date(sprint.startDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-emerald-500" />
                {new Date(sprint.endDate).toLocaleDateString()}
              </span>
            </div>
            
            {sprint.project && (
              <div className="mt-2 text-sm font-semibold text-emerald-600 bg-emerald-100 inline-block px-3 py-1 rounded-full">
                Project: {sprint.project.name}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTask(sprint);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
              <button
                onClick={() => handleSprintClick(sprint)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-sm"
              >
                <Users className="w-4 h-4" />
                View Tasks
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Task Modal */}
      {selectedSprintId && (
        <AssignTaskModal
          open={isModalOpen}
          onClose={handleModalClose}
          onAdd={handleTaskAdd}
          task={task}
          setTask={setTask}
          getUserStatusIcon={getUserStatusIcon}
          projectId={sprints.find(s => s.id === selectedSprintId)?.project?.id}
          sprintId={selectedSprintId}
        />
      )}
    </div>
  );
};

export default ManagerSprintsCards;