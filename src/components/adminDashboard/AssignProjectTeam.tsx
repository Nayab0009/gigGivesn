import React, { useState, useEffect } from "react";
import { Users, Loader2, AlertCircle, Check, Lock } from "lucide-react";
import axiosInstance from "@/lib/axios";
import type { Team, Project } from "@/types";
import { colors } from "@/colors";
import {getProjectTeam} from "@/lib/ProjectService";


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
  ];
  return avatarStyles[index % avatarStyles.length];
};

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
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);

  // Fetch existing project team members
  const fetchExistingTeamMembers = async () => {
    if (!project) return;

    try {
      const existingTeam = await getProjectTeam(project.id);
      // Extract member IDs from the existing team
      const memberIds = existingTeam?.members?.map((member: any) => member.id) || [];
      setAssignedMemberIds(memberIds);
    } catch (error) {
      console.error('Error fetching existing team members:', error);
      // Continue without error - maybe the project doesn't have a team yet
      setAssignedMemberIds([]);
    }
  };

  // Fetch employees from backend and organize them into teams
const fetchTeams = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await axiosInstance.get('/user?role=employee');
    // Your backend response shape: [employeesArray, count]
    const employees = Array.isArray(response.data[0]) ? response.data[0] : [];

    // Group employees by organization instead of department (based on your response)
    const teamsMap = new Map<string, Team>();

    employees.forEach((employee: any, index: number) => {
      const organization = employee.organization?.name || "General";

      if (!teamsMap.has(organization)) {
        teamsMap.set(organization, {
          id: `team-${organization.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${organization} Team`,
          department: organization,
          lead: employee.id,
          members: []
        });
      }

      const team = teamsMap.get(organization)!;
      const teamMember = {
        id: employee.id,
        name: employee.name || employee.email,
        role: employee.role || "Employee",
        email: employee.email,
        avatar: employee.avatar || generateAvatar(employee.name || employee.email, index),
        status: employee.status || "active"
      };

      team.members.push(teamMember);
    });

    setTeams(Array.from(teamsMap.values()));
  } catch (error) {
    console.error("Error fetching employees:", error);
    setError("Failed to load teams. Please try again.");
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

  // Toggle member selection (only if not already assigned)
  const toggleMemberSelection = (memberId: string) => {
    // Don't allow selection if member is already assigned to the project
    if (assignedMemberIds.includes(memberId)) {
      return;
    }

    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Check if a member is already assigned to the project
  const isMemberAssigned = (memberId: string) => {
    return assignedMemberIds.includes(memberId);
  };

  // Get available (unassigned) members count for a team
  const getAvailableMembersCount = (team: Team) => {
    return team.members.filter(member => !isMemberAssigned(member.id)).length;
  };

  // Fetch teams and existing team members when modal opens
  useEffect(() => {
    if (open) {
      fetchExistingTeamMembers();
      fetchTeams();
      setSelectedMembers([]); // Reset selection when modal opens
    }
  }, [open]);

  if (!open || !project) return null;

  return (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
  <div className="bg-black/30 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden border border-white/20 flex flex-col">

    {/* Header */}
    <div className="p-6 text-center bg-black/30 backdrop-blur-md border-b border-white/20">
      <h2 className="text-2xl font-bold text-white mb-1">Assign Team Members</h2>
      <p className="text-gray-300 text-sm">
        Select team members for <span className="font-semibold">{project.title}</span>
      </p>
      {selectedMembers.length > 0 && (
        <p className="text-gray-400 text-sm mt-1">
          {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""} selected
        </p>
      )}
      {assignedMemberIds.length > 0 && (
        <p className="text-blue-400 text-sm mt-1">
          {assignedMemberIds.length} member{assignedMemberIds.length !== 1 ? "s" : ""} already assigned
        </p>
      )}
    </div>

    {/* Content */}
    <div
      className="p-6 bg-black/30 backdrop-blur-md border-t border-b border-white/20 space-y-6 overflow-y-auto scrollbar-hide"
      style={{ maxHeight: "calc(95vh - 220px)" }}
    >
      {!isLoading && !error && teams.map((team) => {
        const availableCount = getAvailableMembersCount(team);
        return (
          <div
            key={team.id}
            className="border border-white/20 rounded-xl p-6 bg-black/20 backdrop-blur-md transition-all duration-300"
          >
            {/* Team Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">{team.name}</h3>
                  <p className="text-sm text-gray-300 font-medium">
                    {team.department} Department
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="text-sm px-4 py-2 rounded-full font-semibold border border-white/20 bg-black/30 backdrop-blur-sm text-white">
                  {team.members.length} total
                </span>
                {availableCount < team.members.length && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium border border-green-400/20 bg-green-400/10 text-green-400">
                    {availableCount} available
                  </span>
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {team.members.map((member) => {
                const isAssigned = isMemberAssigned(member.id);
                const isSelected = selectedMembers.includes(member.id);

                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMemberSelection(member.id)}
                    className={`relative p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isAssigned
                        ? "bg-gray-700/40 border-gray-500/30 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "bg-black/60 border-white/40 shadow-md"
                        : "bg-black/40 border-white/20 hover:bg-black/50"
                    }`}
                  >
                    {/* Check / Lock Indicator */}
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
                      {isAssigned ? (
                        <Lock className="w-3 h-3 text-gray-300" />
                      ) : isSelected ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : null}
                    </div>

                    <img
                      src={member.avatar}
                      alt={member.name}
                      className={`w-10 h-10 rounded-full border-2 ${
                        isAssigned ? "border-gray-400/40 grayscale" : "border-white/20"
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium truncate ${
                          isAssigned ? "text-gray-400" : "text-white"
                        }`}
                      >
                        {member.name}
                      </div>
                      <div
                        className={`text-sm truncate ${
                          isAssigned ? "text-gray-500" : "text-gray-300"
                        }`}
                      >
                        {member.role}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>

    {/* Footer */}
    <div className="bg-black/30 backdrop-blur-md border-t border-white/20 p-6 flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-6 py-2 rounded-xl border border-white/30 text-gray-200 hover:bg-black/40 transition"
      >
        Cancel
      </button>
      <button
        onClick={assignTeamMembers}
        disabled={selectedMembers.length === 0 || isAssigning}
        style={{ backgroundColor: colors.primary.hex }}
        className="px-6 py-2 rounded-xl text-white font-semibold shadow hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
      >
        {isAssigning && <Loader2 className="w-4 h-4 animate-spin text-white" />}
        <span>{isAssigning ? "Assigning..." : "Assign Members"}</span>
      </button>
    </div>
  </div>
</div>

  );
}