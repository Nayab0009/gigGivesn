"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Plus, RefreshCw, AlertCircle, Edit, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2">Team Members</h1>
          <p className="text-slate-600 text-lg">Manage and track all team members</p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search employees by name, email or ID..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm focus:shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <span className="font-semibold text-slate-800">{filteredMembers.length}</span> of {teamMembers.length}{" "}
                employees
              </div>
              <button
                type="button"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                onClick={() => router.push("/dashboard/admin/addemployee")}
              >
                <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                Add Employee
              </button>
              <button className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105">
                <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden backdrop-blur-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
              <p className="text-slate-600 text-lg">Loading team members...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Employee Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
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
                        className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50/30 transition-all duration-300 ${index % 2 === 0 ? "bg-white" : "bg-slate-25"}`}
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 leading-tight">{member.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                    ID: {member.id || "N/A"}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                                    Team Member
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize ${getRoleColor(member.role)}`}
                          >
                            {member.role || "Employee"}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm font-medium text-slate-900">{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                              <span className="text-sm text-slate-600">{member.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                              <span className="text-sm text-slate-600 max-w-xs truncate" title={member.address}>
                                {member.address}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button className="group inline-flex items-center justify-center w-10 h-10 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1">
                              <Eye className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            </button>
                            <button className="group inline-flex items-center justify-center w-10 h-10 text-teal-600 hover:text-white bg-teal-50 hover:bg-gradient-to-r hover:from-teal-500 hover:to-teal-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1">
                              <Edit className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            </button>
                            <button className="group inline-flex items-center justify-center w-10 h-10 text-rose-600 hover:text-white bg-rose-50 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1">
                              <Trash2 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
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
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{teamMembers.length}</div>
                  <div className="text-sm text-slate-600">Total Employees</div>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{filteredMembers.length}</div>
                  <div className="text-sm text-slate-600">Filtered Results</div>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {teamMembers.filter((member) => member.role?.toLowerCase() === "employee").length}
                  </div>
                  <div className="text-sm text-slate-600">Active Employees</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">System Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
