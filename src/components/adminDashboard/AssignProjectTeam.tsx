import React, { useState, useEffect } from "react";
import { X, UserCheck, Users, Crown, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "@/lib/axios";
import type { Team, Project } from "@/types";

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
  const [error, setError] = useState<string | null>(null);

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

  // Fetch teams when modal opens
  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open]);

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-white/50 backdrop-blur-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Assign Team</h2>
              <p className="text-emerald-200 text-sm">
                Select a team for <span className="font-semibold">{project.title}</span>
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content with hidden scrollbar */}
        <div 
          className="p-6 space-y-4 overflow-y-auto scrollbar-hide"
          style={{
            maxHeight: 'calc(85vh - 120px)',
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
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Teams...</h3>
              <p className="text-gray-500">Fetching available teams from the backend.</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Teams</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchTeams}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Teams List */}
          {!isLoading && !error && teams.map((team, index) => (
            <div
              key={team.id}
              className="group border border-emerald-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50/50 relative overflow-hidden"
              onClick={() => onAssign(team)}
            >
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              
              <div className="relative z-10">
                {/* Team Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-emerald-900 transition-colors">
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {team.department} Department
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm px-4 py-2 rounded-full font-semibold border border-emerald-200">
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-sm text-gray-700">Team Members</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {team.members.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                      >
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
            </div>
          ))}

          {/* No Teams State */}
          {!isLoading && !error && teams.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Available</h3>
              <p className="text-gray-500">No employees found to create teams from.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-emerald-200 bg-emerald-50/50 px-6 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Select a team to assign to your project
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-emerald-300 rounded-xl text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}