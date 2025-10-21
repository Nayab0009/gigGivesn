import React, { useState, useEffect } from "react";
import { Users, Loader2, Check, Lock } from "lucide-react";
import axiosInstance from "@/lib/axios";
import type { Team, Project } from "@/types";
import { colors } from "@/colors";
import { getProjectTeam } from "@/lib/ProjectService";

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
      const memberIds = existingTeam?.members?.map((m: any) => m.id) || [];
      setAssignedMemberIds(memberIds);
    } catch (error) {
      console.error("Error fetching existing team members:", error);
      setAssignedMemberIds([]);
    }
  };

  // Fetch employees from backend and organize them into teams
  const fetchTeams = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/user?role=employee");
      const employees = Array.isArray(response.data[0]) ? response.data[0] : [];

      const teamsMap = new Map<string, Team>();

      employees.forEach((employee: any, index: number) => {
        const organization = employee.organization?.name || "General";

        if (!teamsMap.has(organization)) {
          teamsMap.set(organization, {
            id: `team-${organization.toLowerCase().replace(/\s+/g, "-")}`,
            name: `${organization} Team`,
            department: organization,
            lead: employee.id,
            members: [],
          });
        }

        const team = teamsMap.get(organization)!;
        const teamMember = {
          id: employee.id,
          name: employee.name || employee.email,
          role: employee.role || "Employee",
          email: employee.email,
          avatar:
            employee.avatar ||
            generateAvatar(employee.name || employee.email, index),
          status: employee.status || "active",
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
      let currentMemberIds: string[] = [];

      try {
        const existingTeam = await getProjectTeam(project.id);
        if (existingTeam?.members) {
          currentMemberIds = existingTeam.members.map((m: any) => m.id || m._id);
        } else if (existingTeam?.teamMembers) {
          currentMemberIds = existingTeam.teamMembers.map(
            (m: any) => m.id || m._id
          );
        } else if (Array.isArray(existingTeam)) {
          currentMemberIds = existingTeam.map((m: any) => m.id || m._id);
        } else if (existingTeam?.data?.members) {
          currentMemberIds = existingTeam.data.members.map(
            (m: any) => m.id || m._id
          );
        } else if (existingTeam?.data?.teamMembers) {
          currentMemberIds = existingTeam.data.teamMembers.map(
            (m: any) => m.id || m._id
          );
        }
      } catch {
        currentMemberIds = [];
      }

      const allTeamMembers = [...new Set([...currentMemberIds, ...selectedMembers])];

      const response = await axiosInstance.patch(`/projects/team/${project.id}`, {
        teamMembers: allTeamMembers,
      });

      console.log("Team members assigned successfully:", response.data);

      const selectedTeam = teams.find((team) =>
        team.members.some((m) => selectedMembers.includes(m.id))
      );
      if (selectedTeam) {
        onAssign(selectedTeam);
      }

      setAssignedMemberIds(allTeamMembers);
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error("Error assigning team members:", error);
      setError("Failed to assign team members. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    if (assignedMemberIds.includes(memberId)) return;

    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const isMemberAssigned = (memberId: string) =>
    assignedMemberIds.includes(memberId);

  const getAvailableMembersCount = (team: Team) =>
    team.members.filter((m) => !isMemberAssigned(m.id)).length;

  useEffect(() => {
    if (open) {
      fetchExistingTeamMembers();
      fetchTeams();
      setSelectedMembers([]);
    }
  }, [open]);

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 [background:var(--form-bg)] backdrop-blur-[50px] flex items-center justify-center z-[9999] p-4">
      <div className="[background:var(--form-bg)]  rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden [border:var(--border-style)] [box-shadow:var(--shadow-combined)]   flex flex-col">
        {/* Header */}
        <div className="p-6 text-center [background:var(--form-bg)] backdrop-blur-md border-b border-white/20">
          <h2 className="text-2xl font-bold text-text-main mb-1">
            Assign Team Members
          </h2>
          <p className="text-text-secondary text-sm">
            Select team members for{" "}
            <span className="font-semibold">{project.title}</span>
          </p>
          {selectedMembers.length > 0 && (
            <p className="text-gray-400 text-sm mt-1">
              {selectedMembers.length} member
              {selectedMembers.length !== 1 ? "s" : ""} selected
            </p>
          )}
          {assignedMemberIds.length > 0 && (
            <p className="text-blue-400 text-sm mt-1">
              {assignedMemberIds.length} member
              {assignedMemberIds.length !== 1 ? "s" : ""} already assigned
            </p>
          )}
        </div>

        {/* Content */}
        <div
          className="p-6 [background:var(--form-bg)] backdrop-blur-md border-t border-b border-white/20 space-y-6 overflow-y-auto scrollbar-hide"
          style={{ maxHeight: "calc(95vh - 220px)" }}
        >
          {!isLoading &&
            !error &&
            teams.map((team) => {
              const availableCount = getAvailableMembersCount(team);
              return (
                <div
                  key={team.id}
                  className="border border-white/20 rounded-xl p-6 bg-black/20 backdrop-blur-md transition-all duration-300"
                >
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl border border-white/20 [background:var(--form-bg)] backdrop-blur-sm">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-text-main">
                          {team.name}
                        </h3>
                        <p className="text-sm text-text-secondary font-medium">
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
                              isAssigned
                                ? "border-gray-400/40 grayscale"
                                : "border-white/20"
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
        <div className="[background:var(--form-bg)] backdrop-blur-md border-t border-white/20 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-white/30 text-text-secondary hover:bg-black/40 transition"
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
