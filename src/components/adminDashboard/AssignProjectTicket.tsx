import React, { useState, useEffect } from "react";
import { X, Check, Clock, Users, AlertTriangle, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import axiosInstance from "@/lib/axios";
import type { Project, Task, User, Team } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/colors";

export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

interface AssignTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  task: Task;
  setTask: (task: Task) => void;
  getUserStatusIcon: (status: string) => React.ReactElement;
  projectId?: string | number;
  sprintId?: string | number;
  ticketNumber?: string | number;
  priority?: TaskPriority; 
}

// Helper function to generate avatar
const generateAvatar = (name: string, index: number) => {
  const avatarStyles = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/miniavs/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
  ]
  return avatarStyles[index % avatarStyles.length]
}

export function AssignTaskModal({
  open,
  onClose,
  onAdd,
  task,
  setTask,
  getUserStatusIcon,
  projectId,
  sprintId,
}: AssignTaskModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allMembers, setAllMembers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const today = new Date().toISOString().split("T")[0];

  // Check if user is authorized to assign tasks
  const isAuthorizedToAssignTasks = () => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    const authorizedRoles = ['admin', 'manager'];
    return authorizedRoles.includes(user.role.toLowerCase());
  };

  // Fetch employees from backend and organize them into teams
  const fetchTeams = async () => {
    if (!isAuthorizedToAssignTasks()) {
      setError('You are not authorized to assign tasks. Only admins and managers can assign tasks.');
      return;
    }

    if (!projectId) {
      setError('Project ID is required to fetch team members.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get(`/projects/${projectId}`);
      const projectData = response.data;
      
      if (!projectData.teamMembers || !Array.isArray(projectData.teamMembers)) {
        setError('No team members found for this project.');
        setTeams([]);
        setAllMembers([]);
        return;
      }
      
      const teamMembers = projectData.teamMembers;
      const teamsMap = new Map<string, Team>();
      const allMembersArray: User[] = [];
      
      teamMembers.forEach((member: any, index: number) => {
        const department = member.department || 'General';
        
        if (!teamsMap.has(department)) {
          teamsMap.set(department, {
            id: `team-${department.toLowerCase().replace(/\s+/g, '-')}`,
            name: `${department} Team`,
            department: department,
            lead: member.id,
            members: []
          });
        }
        
        const team = teamsMap.get(department)!;
        const teamMember = {
          id: member.id,
          name: member.name || member.email,
          role: member.role || 'Employee',
          email: member.email,
          avatar: member.avatar || generateAvatar(member.name || member.email, index),
          status: member.status || 'active'
        };
        
        team.members.push(teamMember);
        allMembersArray.push(teamMember);
      });
      
      setTeams(Array.from(teamsMap.values()));
      setAllMembers(allMembersArray);
      
    } catch (error) {
      console.error('Error fetching project team members:', error);
      setError('Failed to load project team members. Please try again.');
      setTeams([]);
      setAllMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!isAuthorizedToAssignTasks()) {
      setError('You are not authorized to assign tasks. Only admins and managers can assign tasks.');
      return;
    }

    if (!task.title.trim() || task.assignedTo.length === 0) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const createTaskPromises = task.assignedTo.map(async (userId: string) => {
        const taskData = {
          ticketNumber: task.ticketNumber?.trim(),
          title: task.title.trim(),
          description: task.description.trim() || '',
          taskFor: parseInt(userId),
          taskOf: projectId || 1,
          assignedBy: user?.id,
          sprint: sprintId ? { id: sprintId } : undefined,
          taskDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
          priority: task.priority || TaskPriority.MEDIUM,
        };

        const response = await axiosInstance.post('/tasks', taskData);
        return response;
      });

      await Promise.all(createTaskPromises);

      // Show success message
      const assignedMemberNames = allMembers
        .filter(member => task.assignedTo.includes(member.id))
        .map(member => member.name)
        .join(', ');
      
      setSuccessMessage(`Task "${task.title}" has been successfully created and assigned to ${assignedMemberNames}.`);
      setShowSuccess(true);

      // Auto-hide success message and close modal after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onAdd();
        onClose();
        
        // Reset the task
        setTask({
          ...task,
          ticketNumber: '',
          title: '',
          description: '',
          assignedTo: [],
          dueDate: '',
        });
      }, 3000);

    } catch (error: any) {
      console.error('Error creating tasks:', error);
      setError(
        error.response?.data?.message || 
        'Failed to create tasks. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle assignment
  const toggleAssignment = (userId: string) => {
    setTask({
      ...task,
      assignedTo: [userId], 
    });
  };

  // Fetch teams when modal opens
  useEffect(() => {
    if (open) {
      fetchTeams();
      setShowSuccess(false); // Reset success state when modal opens
    }
  }, [open]);

  if (!open) return null;

  // Show authorization error if user is not authorized
  if (!isAuthorizedToAssignTasks()) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You are not authorized to assign tasks. Only administrators and managers can assign tasks to team members.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success Message Overlay
  if (showSuccess) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-black/40 rounded-3xl shadow-2xl w-full max-w-md border-2 border-white/40 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Task Created Successfully!</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">{successMessage}</p>
            <div className="flex items-center justify-center text-gray-400 text-sm">
              <Clock className="w-4 h-4 mr-2" />
              Closing automatically in 3 seconds...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-black/40 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden border-2 border-white/40">

        {/* Header */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-1">Create New Task</h2>
          <p className="text-gray-300 text-sm">Add a task and assign team members</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-4 bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 border border-white/30 rounded-2xl space-y-6 overflow-y-auto scrollbar-hide m-4" style={{ maxHeight: "calc(95vh - 220px)" }}>
          {/* Ticket Number */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Ticket Number*</label>
            <div className="flex items-center">
              <span className="px-4 py-3 rounded-l-xl bg-black/50 text-white font-semibold border-r border-white/10">
                {task.ticketNumber?.split('-')[0] || ''}
              </span>
              <input
                type="text"
                value={task.ticketNumber?.split('-')[1] ?? ''}
                onChange={(e) => {
                  const prefix = task.ticketNumber?.split('-')[0] || '';
                  setTask({
                    ...task,
                    ticketNumber: `${prefix}-${e.target.value}`,
                  });
                }}
                placeholder="001"
                disabled={isCreating}
                className="w-full px-4 py-3 rounded-r-xl bg-black/70 text-white placeholder-white focus:outline-none"
              />
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Task Title*</label>
            <input
              type="text"
              value={task.title ?? ""}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              placeholder="Title ..."
              disabled={isCreating}
              className="w-full px-4 py-3 rounded-xl bg-black/70 text-white placeholder-white focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              value={task.description ?? ""}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              placeholder="Description ..."
              rows={3}
              disabled={isCreating}
              className="w-full px-4 py-3 rounded-xl bg-black/70 text-white placeholder-white resize-none focus:outline-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Task Due Date*</label>
            <input
              type="date"
              min={today}
              value={task.dueDate ? task.dueDate.substring(0, 10) : ""}
              onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
              disabled={isCreating}
              className="w-full px-4 py-3 rounded-xl bg-black/70 text-white focus:outline-none"
            />
          </div>

          {/* Task Priority */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Priority*</label>
            <select
              value={task.priority || TaskPriority.MEDIUM}
              onChange={(e) => setTask({ ...task, priority: e.target.value as TaskPriority })}
              disabled={isCreating}
              className="w-full px-4 py-3 rounded-xl bg-black/70 text-white focus:outline-none"
            >
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.LOW}>Low</option>
            </select>
          </div>

          {/* Assign Team Members */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Assign Team Members*</h3>
            {teams.map((team) => (
              <div key={team.id} className="mb-4">
                <p className="text-sm text-gray-300 mb-2">{team.department} Department</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {team.members.map((member: any) => (
                    <div
                      key={member.id}
                      onClick={() => !isCreating && toggleAssignment(member.id)}
                      className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                        task.assignedTo[0] === member.id 
                          ? "bg-white/20 border-white/40" 
                          : "bg-black/30 border-white/20 hover:bg-black/40"
                      }`}
                    >
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border" />
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-gray-400 text-sm">{member.role}</p>
                      </div>
                      {task.assignedTo[0] === member.id && (
                        <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-white/20 p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-6 py-2 rounded-xl border border-gray-400 text-gray-200 hover:bg-white/10 disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateTask}
            disabled={!task.title.trim() || task.assignedTo.length === 0 || isCreating}
            style={{ backgroundColor: colors.primary.hex }}
            className="px-6 py-2 rounded-xl text-white font-semibold shadow hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCreating ? "Creating..." : `Create Task (${task.assignedTo.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}