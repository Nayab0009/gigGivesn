import React, { useState, useEffect } from "react";
import { X, Check, Clock, Users, AlertTriangle, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "@/lib/axios";
import type { Project, Task, User, Team } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/colors";
interface AssignTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  task: Task;
  setTask: (task: Task) => void;
  getUserStatusIcon: (status: string) => React.ReactElement;
  projectId?: string | number; // Allow both string and number
  sprintId?: string | number; // Add sprintId prop
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
  sprintId, // Add sprintId parameter
}: AssignTaskModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allMembers, setAllMembers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Check if user is authorized to assign tasks
  const isAuthorizedToAssignTasks = () => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    // Only admin and manager can assign tasks
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
      // Fetch project details to get team members assigned to this specific project
      const response = await axiosInstance.get(`/projects/${projectId}`);
      const projectData = response.data;
      
      if (!projectData.teamMembers || !Array.isArray(projectData.teamMembers)) {
        setError('No team members found for this project.');
        setTeams([]);
        setAllMembers([]);
        return;
      }
      
      const teamMembers = projectData.teamMembers;
      
      // Group team members by department to create teams
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
      
      console.log('Project team members loaded:', teamMembers);
      console.log('Teams created:', Array.from(teamsMap.values()));
      
    } catch (error) {
      console.error('Error fetching project team members:', error);
      setError('Failed to load project team members. Please try again.');
      setTeams([]);
      setAllMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create tasks for each assigned user
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
      // Create a task for each assigned user
      const createTaskPromises = task.assignedTo.map(async (userId: string) => {
        const taskData = {
          title: task.title.trim(),
          description: task.description.trim() || '',
          taskFor: parseInt(userId), // ID of the user the task is assigned to
          taskOf: projectId || 1, // ID of the project the task belongs to
          assignedBy: user?.id, // ID of the user who is assigning the task
          sprint: sprintId ? { id: sprintId } : undefined, // Include sprint object if sprintId is provided
        };

        console.log('Sending task data:', taskData);
        console.log('Request URL:', axiosInstance.defaults.baseURL + '/tasks');
        console.log('Current user:', user);

        const response = await axiosInstance.post('/tasks', taskData);
        console.log('Task creation response:', response.data);
        
        return response;
      });

      // Wait for all tasks to be created
      await Promise.all(createTaskPromises);

      // Call the original onAdd callback
      onAdd();

      // Close the modal
      onClose();

      // Reset the task
      setTask({
        ...task,
        title: '',
        description: '',
        assignedTo: []
      });

    } catch (error: any) {
      console.error('Error creating tasks:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
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
    const newAssigned = task.assignedTo.includes(userId)
      ? task.assignedTo.filter((id: string) => id !== userId)
      : [...task.assignedTo, userId];
    
    setTask({ ...task, assignedTo: newAssigned });
  };

  // Fetch teams when modal opens
  useEffect(() => {
    if (open) {
      fetchTeams();
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-white/50 backdrop-blur-sm mx-4 ml-16 lg:ml-20">
        {/* Header */}
        <div className="p-6 text-white"  style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
            }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Create New Task</h2>
                <p className="text-blue-200 text-sm">Add a task and assign team members</p>
                {task.assignedTo.length > 0 && (
                  <p className="text-blue-100 text-sm mt-1">
                    {task.assignedTo.length} member{task.assignedTo.length !== 1 ? 's' : ''} assigned
                  </p>
                )}
                <p className="text-blue-100 text-sm mt-1">
                  Assigned by: {user?.name} ({user?.role})
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              disabled={isCreating}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content with Hidden Scrollbar */}
        <div 
          className="p-6 space-y-6 overflow-y-auto"
          style={{
            maxHeight: 'calc(95vh - 280px)',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
        >
          <style jsx>{`
            .overflow-y-auto::-webkit-scrollbar {
              display: none !important; /* Chrome, Safari, Opera */
              width: 0 !important;
              height: 0 !important;
            }
            .overflow-y-auto::-webkit-scrollbar-track {
              display: none !important;
            }
            .overflow-y-auto::-webkit-scrollbar-thumb {
              display: none !important;
            }
            .overflow-y-auto::-webkit-scrollbar-corner {
              display: none !important;
            }
          `}</style>

          {/* Task Title */}
          <div className="group">
            <label htmlFor="task-title" className="block text-sm font-semibold text-gray-800 mb-2">
              Task Title*
            </label>
            <input
              id="task-title"
              type="text"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none transition-all duration-200"
              style={{
                borderColor: colors.primary.hex,
                background: colors.accent.hex + '30',
                color: colors.primary.hex,
              }}
              placeholder="Enter a descriptive task title..."
              disabled={isCreating}
            />
          </div>

          {/* Task Description */}
          <div className="group">
            <label htmlFor="task-description" className="block text-sm font-semibold text-gray-800 mb-2">
              Description
            </label>
            <textarea
              id="task-description"
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none transition-all duration-200 resize-none"
              style={{
                borderColor: colors.primary.hex,
                background: colors.accent.hex + '30',
                color: colors.primary.hex,
              }}
              placeholder="Describe the task details and requirements..."
              rows={3}
              disabled={isCreating}
            />
          </div>

          {/* Team Member Assignment */}
          <div className="group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" style={{ color: colors.primary.hex }} />
                <span className="font-semibold text-sm text-gray-700">Assign Team Members*</span>
              </div>
              <span className="text-sm px-4 py-2 rounded-full font-semibold border"
                style={{
                  background: colors.accent.hex + '40',
                  color: colors.primary.hex,
                  borderColor: colors.primary.hex,
                }}
              >
                {task.assignedTo.length} selected
              </span>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: colors.primary.hex }} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Teams...</h3>
                <p className="text-gray-500">Fetching available teams from the backend.</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                {!isCreating && (
                  <button
                    onClick={fetchTeams}
                    className="px-4 py-2 rounded-lg transition-colors text-white"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                    }}
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            {/* Teams List */}
            {!isLoading && !error && teams.map((team) => (
              <div
                key={team.id}
                className="border rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden mb-4"
                style={{
                  borderColor: colors.primary.hex,
                  background: colors.accent.hex + '20',
                }}
              >
                {/* Team Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                      }}
                    >
                      <Users className="w-6 h-6" style={{ color: '#fff' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {team.department} Department
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm px-4 py-2 rounded-full font-semibold border"
                      style={{
                        background: colors.accent.hex + '40',
                        color: colors.primary.hex,
                        borderColor: colors.primary.hex,
                      }}
                    >
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-4 h-4" style={{ color: colors.primary.hex }} />
                    <span className="font-semibold text-sm text-gray-700">Select Team Members</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {team.members.map((member: any) => (
                      <div
                        key={member.id}
                        className={`relative flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          task.assignedTo.includes(member.id)
                            ? 'shadow-md'
                            : 'hover:shadow'
                        } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{
                          background: task.assignedTo.includes(member.id)
                            ? colors.highlight.hex + '20'
                            : colors.accent.hex + '20',
                          borderColor: colors.primary.hex,
                        }}
                        onClick={() => !isCreating && toggleAssignment(member.id)}
                      >
                        {/* Selection indicator */}
                        {task.assignedTo.includes(member.id) && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: colors.primary.hex }}
                          >
                            <Check className="w-3 h-3" style={{ color: '#fff' }} />
                          </div>
                        )}
                        
                        <div className="relative flex-shrink-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white rounded-full shadow-sm">
                            {getUserStatusIcon(member.status)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {member.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* No Teams State */}
            {!isLoading && !error && teams.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16" style={{ color: colors.accent.hex }} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Available</h3>
                <p className="text-gray-500">No employees found to create teams from.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom with better button visibility */}
        <div className="border-t px-6 py-6"
          style={{
            borderColor: colors.primary.hex,
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
          }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" style={{ color: colors.primary.hex }} />
                <p className="text-sm text-white font-medium">
                  {task.assignedTo.length > 0 
                    ? `${task.assignedTo.length} member${task.assignedTo.length !== 1 ? 's' : ''} selected`
                    : 'Select team members to assign to your task'
                  }
                </p>
              </div>
              {task.title.trim() && (
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4" style={{ color: colors.primary.hex }} />
                  <p className="text-sm font-medium" style={{color:colors.primary.hex}}>Task title provided</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                disabled={isCreating}
                className="px-6 py-3 border-2 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                style={{
                  borderColor: colors.primary.hex,
                  color: colors.primary.hex,
                  background: '#fff',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!task.title.trim() || task.assignedTo.length === 0 || isCreating}
                className="px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 flex-1 sm:flex-none shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={
                  !task.title.trim() || task.assignedTo.length === 0 || isCreating
                    ? { background: '#ccc', color: '#fff' }
                    : { background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`, color: '#fff' }
                }
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#fff' }} />
                    <span>Creating Tasks...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" style={{ color: '#fff' }} />
                    <span>Create Task ({task.assignedTo.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Validation Messages */}
          <div className="mt-3 space-y-1">
            {!task.title.trim() && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Task title is required</span>
              </p>
            )}
            {task.title.trim() && task.assignedTo.length === 0 && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Please select at least one team member</span>
              </p>
            )}
            {task.title.trim() && task.assignedTo.length > 0 && (
              <p className="text-sm" style={{ color: colors.primary.hex }}>
                <Check className="w-3 h-3" style={{ color: colors.primary.hex }} />
                <span>Ready to create task for {task.assignedTo.length} member{task.assignedTo.length !== 1 ? 's' : ''}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}