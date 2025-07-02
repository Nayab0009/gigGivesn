"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Plus, RefreshCw, AlertCircle, Edit, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import { colors } from "@/colors"

interface TeamMember {
  id?: string | number
  name: string
  email: string
  phone: string
  address: string
  role?: string
}

const generateAvatar = (name: string, index: number) => {
  const avatarStyles = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/miniavs/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
  ]
  return avatarStyles[index % avatarStyles.length]
}

const getRoleColor = (role?: string) => {
  switch (role?.toLowerCase()) {
    case "employee":
      return "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200 shadow-sm"
    case "developer":
      return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 ring-1 ring-green-200 shadow-sm"
    case "designer":
      return "bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border-teal-200 ring-1 ring-teal-200 shadow-sm"
    case "manager":
      return "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border-cyan-200 ring-1 ring-cyan-200 shadow-sm"
    default:
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 ring-1 ring-slate-200 shadow-sm"
  }
}

export default function TeamListPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true)
      try {
        const res = await axiosInstance.get("/user?role=employee")
        let membersData: TeamMember[] = []
        if (Array.isArray(res.data)) {
          membersData = res.data
        } else {
          membersData = [res.data]
        }
        // Add mock roles for better visualization
        membersData = membersData.map((member, idx) => ({
          ...member,
          role: member.role || ["Employee", "Developer", "Designer", "QA Engineer"][idx % 4],
        }))
        setTeamMembers(membersData)
      } catch (e) {
        setTeamMembers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(
      (member) =>
        (member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (member.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
    )
  }, [teamMembers, searchTerm])

  return (
    <div
  
      className="p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Team Members
          </h1>
          <p
            className="text-lg"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Manage and track all team members
          </p>
        </div>

        {/* Action Bar */}
        <div
          className="mb-8 rounded-2xl shadow-lg border p-6"
          style={{
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
            color: '#fff',
            borderColor: colors.primary.hex,
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: colors.accent.hex }}
              />
              <input
                type="text"
                placeholder="Search employees by name, email or ID..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl focus:ring-2 transition-all duration-300 shadow-sm focus:shadow-md"
                style={{
                  background: '#fff',
                  color: colors.primary.hex,
                  border: `1px solid ${colors.primary.hex}`,
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div
                className="text-sm px-4 py-2 rounded-full border"
                style={{
                  background: colors.accent.hex,
                  color: colors.primary.hex,
                  borderColor: colors.primary.hex,
                }}
              >
                <span className="font-semibold" style={{ color: colors.primary.hex }}>{filteredMembers.length}</span> of {teamMembers.length} employees
              </div>
              <button
                type="button"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                  color: '#fff',
                  border: `1px solid ${colors.primary.hex}`,
                }}
                onClick={() => router.push("/dashboard/admin/addemployee")}
              >
                <Plus className="w-4 h-4" style={{ color: colors.highlight.hex }} />
                Add Employee
              </button>
              <button
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                style={{
                  background: '#fff',
                  color: colors.primary.hex,
                  border: `1px solid ${colors.primary.hex}`,
                }}
              >
                <RefreshCw className="w-4 h-4" style={{ color: colors.secondary.hex }} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div
          className="rounded-2xl shadow-lg border overflow-hidden"
          style={{
            background: '#fff',
            borderColor: colors.primary.hex,
          }}
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                style={{ background: colors.accent.hex }}
              >
                <RefreshCw className="w-6 h-6 animate-spin" style={{ color: colors.primary.hex }} />
              </div>
              <p className="text-lg" style={{ color: colors.primary.hex }}>Loading team members...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: colors.primary.hex }}>
                <thead style={{ background: colors.accent.hex }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Employee Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Contact Information</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-600 text-lg font-medium mb-1">No team members found</p>
                          <p className="text-slate-500">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member, index) => (
                      <tr
                        key={member.id || index}
                        className={
                          `bg-white transition-all duration-300 hover:bg-gradient-to-r hover:from-[${colors.primary.hex}] hover:to-[${colors.secondary.hex}] hover:text-white`
                        }
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                                  color: '#fff',
                                }}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold leading-tight" style={{ color: colors.primary.hex }}>{member.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" style={{ background: colors.accent.hex, color: colors.primary.hex }}>
                                    ID: {member.id || "N/A"}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" style={{ background: colors.highlight.hex, color: colors.primary.hex }}>
                                    Team Member
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize"
                            style={{
                              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                              color: '#fff',
                            }}
                          >
                            {member.role || "Employee"}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: colors.primary.hex }}></div>
                              <span className="text-sm font-medium" style={{ color: colors.primary.hex }}>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: colors.secondary.hex }}></div>
                              <span className="text-sm" style={{ color: colors.secondary.hex }}>{member.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: colors.accent.hex }}></div>
                              <span className="text-sm max-w-xs truncate" title={member.address} style={{ color: colors.accent.hex }}>
                                {member.address}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1"
                              style={{
                                background: colors.accent.hex,
                                color: colors.primary.hex,
                              }}
                            >
                              <Eye className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            </button>
                            <button
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1"
                              style={{
                                background: colors.highlight.hex,
                                color: colors.primary.hex,
                              }}
                            >
                              <Edit className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            </button>
                            <button
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1"
                              style={{
                                background: colors.warning.hex,
                                color: '#fff',
                              }}
                            >
                              <Trash2 className="w-4 h-4" style={{ color: '#fff' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {!isLoading && (
          <div
            className="mt-8 rounded-2xl shadow-lg border p-6"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              color: '#fff',
              borderColor: colors.primary.hex,
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <div className="text-sm">Total Employees</div>
                </div>
                <div className="w-px h-12" style={{ background: colors.accent.hex }}></div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{filteredMembers.length}</div>
                  <div className="text-sm">Filtered Results</div>
                </div>
                <div className="w-px h-12" style={{ background: colors.accent.hex }}></div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {teamMembers.filter((member) => member.role?.toLowerCase() === "employee").length}
                  </div>
                  <div className="text-sm">Active Employees</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: colors.highlight.hex }}></div>
                <span className="text-sm">System Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
