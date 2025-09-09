import React, { useState, useEffect } from "react";
import { X, UserCheck, Users, Crown, ChevronRight, Loader2, AlertCircle, Check } from "lucide-react";
import axiosInstance from "@/lib/axios";
import type { Team, Project } from "@/types";
import { colors } from "@/colors";
interface AssignTeamModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (team: Team) => void;
  project: Project | null;
  teams: Team[];
  getUserStatusIcon: (status: string) => React.JSX.Element;
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

export function AssignTeamModal({
  open,
  onClose,
  onAssign,
  project,
  teams: initialTeams,
  getUserStatusIcon,
}: AssignTeamModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Fetch employees from backend and organize them into teams
  const fetchTeams = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/user?role=employee');
      const employees = Array.isArray(response.data) ? response.data : [];
      
      // Group employees by department to create teams
      const teamsMap = new Map<string, Team>();
      
      employees.forEach((employee: any, index: number) => {
        const department = employee.department || 'General';
        
        if (!teamsMap.has(department)) {
          teamsMap.set(department, {
            id: `team-${department.toLowerCase().replace(/\s+/g, '-')}`,
            name: `${department} Team`,
            department: department,
            lead: employee.id, // First employee becomes the lead
            members: []
          });
        }
        
        const team = teamsMap.get(department)!;
        const teamMember = {
          id: employee.id,
          name: employee.name || employee.email,
          role: employee.role || 'Employee',
          email: employee.email,
          avatar: employee.avatar || generateAvatar(employee.name || employee.email, index),
          status: employee.status || 'active'
        };
        
        team.members.push(teamMember);
      });
      
      setTeams(Array.from(teamsMap.values()));
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load teams. Please try again.');
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Assign team members to project
  const assignTeamMembers = async () => {
    if (!project || selectedMembers.length === 0) return;

    setIsAssigning(true);
    setError(null);

    try {
      const response = await axiosInstance.patch(`/projects/team/${project.id}`, {
        teamMembers: selectedMembers
      });

      console.log('Team members assigned successfully:', response.data);
      
      // Call the onAssign callback with the selected team
      const selectedTeam = teams.find(team => 
        team.members.some(member => selectedMembers.includes(member.id))
      );
      if (selectedTeam) {
        onAssign(selectedTeam);
      }
      
      // Reset selection and close modal
      setSelectedMembers([]);
      onClose();
      
    } catch (error) {
      console.error('Error assigning team members:', error);
      setError('Failed to assign team members. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Toggle member selection
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Fetch teams when modal opens
  useEffect(() => {
    if (open) {
      fetchTeams();
      setSelectedMembers([]); // Reset selection when modal opens
    }
  }, [open]);

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 text-white flex-shrink-0 bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Assign Team Members</h2>
              <p className="text-gray-300 text-sm">
                Select team members for <span className="font-semibold">{project.title}</span>
              </p>
              {selectedMembers.length > 0 && (
                <p className="text-gray-400 text-sm mt-1">
                  {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content with hidden scrollbar */}
        <div 
          className="p-6 space-y-4 overflow-y-auto scrollbar-hide flex-1"
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
        >
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
          `}</style>
          
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Loading Teams...</h3>
              <p className="text-gray-400">Fetching available teams from the backend.</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Error Loading Teams</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchTeams}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/10"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Teams List */}
          {!isLoading && !error && teams.map((team, index) => (
            <div
              key={team.id}
              className="border border-white/20 rounded-xl p-6 hover:bg-white/5 transition-all duration-300 relative overflow-hidden bg-white/10 backdrop-blur-sm"
            >
              {/* Team Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-300 font-medium">
                      {team.department} Department
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm px-4 py-2 rounded-full font-semibold border border-white/20 bg-white/10 backdrop-blur-sm text-white">
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-4 h-4 text-white" />
                  <span className="font-semibold text-sm text-gray-200">Select Team Members</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {team.members.map((member: any) => (
                    <div
                      key={member.id}
                      className={`relative flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                        selectedMembers.includes(member.id)
                          ? 'bg-white/20 border-white/30 shadow-md'
                          : 'bg-white/10 border-white/20 hover:bg-white/15'
                      }`}
                      onClick={() => toggleMemberSelection(member.id)}
                    >
                      {/* Selection indicator */}
                      {selectedMembers.includes(member.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-white/30 backdrop-blur-sm border border-white/20">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      
                      <div className="relative flex-shrink-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-black/50 rounded-full shadow-sm backdrop-blur-sm">
                          {getUserStatusIcon(member.status)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-300 truncate">
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
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Teams Available</h3>
              <p className="text-gray-400">No employees found to create teams from.</p>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t border-white/10 px-6 py-4 flex-shrink-0 bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-300">
                {selectedMembers.length > 0 
                  ? `${selectedMembers.length} member${selectedMembers.length !== 1 ? 's' : ''} selected`
                  : 'Select team members to assign to your project'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-2.5 border border-white/20 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 text-white bg-white/5 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={assignTeamMembers}
                disabled={selectedMembers.length === 0 || isAssigning}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 whitespace-nowrap backdrop-blur-sm border border-white/20"
                style={
                  selectedMembers.length === 0 || isAssigning
                    ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }
                    : { background: 'rgba(255, 255, 255, 0.2)', color: '#fff' }
                }
              >
                {isAssigning && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>{isAssigning ? 'Assigning...' : 'Assign Members'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}