"use client"
import { Users } from "lucide-react"

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  status?: string
  isActive?: boolean
}

type Manager = {
  id: string
  name: string
  email: string
  role?: string
  isActive?: boolean
  avatar?: string
}

type Project = {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  status?: string
  isActive?: boolean
  teamMembers?: TeamMember[]
  manager?: Manager
}

type MembersTabProps = {
  project: Project | null
  membersLoading?: boolean
  members?: TeamMember[]
}

const MembersTab = ({ project, membersLoading, members }: MembersTabProps) => {
  if (membersLoading) {
    return (
      <div className="p-12 text-center border border-white/10 rounded-2xl max-w-xl w-full mx-auto" >
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
          <div className="w-6 h-6 text-emerald-600 animate-spin border-2 border-emerald-600 border-t-transparent rounded-full" />
        </div>
        <p className="text-text-main">Loading members…</p>
      </div>
    )
  }
  console.log("members", members, project);
  return (
    <div
      className="    border-t border-t-[#FFFFFF4D]  rounded-[22px] p-[22px] [border:var(--border-style)]
 [box-shadow:var(--shadow-combined)] backdrop-blur-xl overflow-hidden    m-2 [background:var(--container-bg)] "
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-main">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-main">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-main">Role in project</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-main">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Render manager first if exists */}
            {project?.manager && (
              <tr
                key={`manager-${project.manager.id}`}
                className="hover:bg-white/5 transition-colors divide-x divide-white/10"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {project.manager.avatar ? <img src={project.manager.avatar} alt={project.manager.name} className="w-8 h-8 rounded-full object-cover" /> :   <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-text-main font-bold text-sm">
                      {project.manager.name.charAt(0)}
                    </div>}
                    <span className="text-text-main font-medium">
                      {project.manager.name}{" "}
                      <span className="ml-1 text-xs text-"></span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-main">{project.manager.email}</td>
                <td className="px-6 py-4 text-text-main">
                  {project.manager.role || "Manager"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-text-main font-medium">
                      {project.manager.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {/* Render team members */}
            {project?.teamMembers?.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-white/5 transition-colors divide-x divide-white/10"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {member.avatar ? <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                      {member.name.charAt(0)}
                    </div>}
                    <span className="text-text-main font-medium">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-main">{member.email}</td>
                <td className="px-6 py-4 text-text-main">
                  {member.role || "Project Member"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-text-main font-medium">
                      {"isActive" in member
                        ? member.isActive
                          ? "Active"
                          : "Inactive"
                        : "Active"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {(!project?.teamMembers || project.teamMembers.length === 0) && (
              <tr>
                <td className="px-6 py-8 text-center text-white/60" colSpan={5}>
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p>No team members found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MembersTab
