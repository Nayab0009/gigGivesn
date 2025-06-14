import { X, UserCheck, Users, Crown, ChevronRight } from "lucide-react";
import type { Team, Project } from "../types";

interface AssignTeamModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (team: Team) => void;
  project: Project | null;
  teams: Team[];
  getUserStatusIcon: (status: string) => JSX.Element;
}

export function AssignTeamModal({
  open,
  onClose,
  onAssign,
  project,
  teams,
  getUserStatusIcon,
}: AssignTeamModalProps) {
  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Assign Team</h2>
              <p className="text-blue-100 text-sm">
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
          
          {teams.map((team, index) => (
            <div
              key={team.id}
              className="group border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 relative overflow-hidden"
              onClick={() => onAssign(team)}
            >
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              
              <div className="relative z-10">
                {/* Team Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-900 transition-colors">
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {team.department} Department
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm px-4 py-2 rounded-full font-semibold border border-blue-200">
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Team Lead */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-sm text-gray-700">Team Lead</span>
                  </div>
                  {team.members
                    .filter((m) => m.id === team.lead)
                    .map((lead) => (
                      <div key={lead.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                        <div className="relative">
                          <img
                            src={lead.avatar}
                            alt={lead.name}
                            className="w-12 h-12 rounded-full border-3 border-white shadow-md"
                          />
                          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                            {getUserStatusIcon(lead.status)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-600">{lead.role}</div>
                          <div className="text-xs text-gray-500">{lead.email}</div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-sm text-gray-700">Team Members</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {team.members
                      .filter((m) => m.id !== team.lead)
                      .map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
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

          {teams.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Available</h3>
              <p className="text-gray-500">Create a team first to assign to this project.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Select a team to assign to your project
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}