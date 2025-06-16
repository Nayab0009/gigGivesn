"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Plus, RefreshCw, Edit, Trash2, Eye, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"

interface Manager {
  id?: string
  name: string
  email: string
  phone: string
  address: string
  team?: { name: string; role?: string; avatar?: string }[]
}

const generateAvatar = (name: string, index: number) => {
  const avatarStyles = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=a7f3d0,bbf7d0,d1fae5,ecfdf5,f0fdfa`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=a7f3d0,bbf7d0,d1fae5,ecfdf5,f0fdfa`,
    `https://api.dicebear.com/7.x/miniavs/svg?seed=${name}&backgroundColor=a7f3d0,bbf7d0,d1fae5,ecfdf5,f0fdfa`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}&backgroundColor=a7f3d0,bbf7d0,d1fae5,ecfdf5,f0fdfa`,
  ]
  return avatarStyles[index % avatarStyles.length]
}

export default function EnhancedManagersTable() {
  const [isLoading, setIsLoading] = useState(true)
  const [managers, setManagers] = useState<Manager[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchManagers = async () => {
      setIsLoading(true)
      try {
        // Simulate fetching managers with teams (mock team data)
        const res = await axiosInstance.get("/user?role=manager")
        let managersData: Manager[] = []
        if (Array.isArray(res.data)) {
          managersData = res.data
        } else {
          managersData = [res.data]
        }
        // Simulate team members for each manager
        managersData = managersData.map((mgr, idx) => ({
          ...mgr,
          team: [
            { name: "Sarah Chen", role: "Frontend", avatar: generateAvatar("Sarah Chen", 0) },
            { name: "David Kim", role: "Backend", avatar: generateAvatar("David Kim", 1) },
            { name: "Emma Watson", role: "QA", avatar: generateAvatar("Emma Watson", 2) },
            { name: "John Smith", role: "UI/UX", avatar: generateAvatar("John Smith", 3) },
          ].slice(0, Math.floor(Math.random() * 4) + 1),
        }))
        setManagers(managersData)
      } catch (e) {
        console.error("Error fetching managers:", e)
        setManagers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchManagers()
  }, [])

  // Filter data
  const filteredManagers = useMemo(() => {
    return managers.filter((manager) => {
      const matchesSearch =
        manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (manager.id?.toLowerCase?.().includes(searchTerm.toLowerCase()) ?? false)
      return matchesSearch
    })
  }, [managers, searchTerm])

  // Function to refresh data
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const res = await axiosInstance.get("/user?role=manager")
      let managersData: Manager[] = []
      if (Array.isArray(res.data)) {
        managersData = res.data
      } else {
        managersData = [res.data]
      }
      // Simulate team members for each manager
      managersData = managersData.map((mgr, idx) => ({
        ...mgr,
        team: [
          { name: "Sarah Chen", role: "Frontend", avatar: generateAvatar("Sarah Chen", 0) },
          { name: "David Kim", role: "Backend", avatar: generateAvatar("David Kim", 1) },
          { name: "Emma Watson", role: "QA", avatar: generateAvatar("Emma Watson", 2) },
          { name: "John Smith", role: "UI/UX", avatar: generateAvatar("John Smith", 3) },
        ].slice(0, Math.floor(Math.random() * 4) + 1),
      }))
      setManagers(managersData)
    } catch (e) {
      console.error("Error refreshing managers:", e)
      setManagers([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8 ml-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Managers Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage and track all project managers</p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-100 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search managers by name, email or ID..."
                className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md bg-white/80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700 bg-white/60 px-4 py-2 rounded-full border border-emerald-200">
                <span className="font-semibold text-gray-800">{filteredManagers.length}</span> of {managers.length}{" "}
                managers
              </div>
              <button
                type="button"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                onClick={() => router.push("/dashboard/admin/addmanager")}
              >
                <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                Add Manager
              </button>
              <button
                className="group inline-flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white border border-emerald-200 hover:border-emerald-300 text-gray-700 hover:text-gray-800 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 transition-transform duration-300 ${isLoading ? "animate-spin" : "group-hover:rotate-180"}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-lg border border-white/50 overflow-hidden backdrop-blur-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
              <p className="text-gray-600 text-lg">Loading managers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-200">
                <thead className="bg-gradient-to-r from-emerald-100 to-teal-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Manager Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Team Members
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 divide-y divide-emerald-100">
                  {filteredManagers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-emerald-500" />
                          </div>
                          <p className="text-gray-600 text-lg font-medium mb-1">No managers found</p>
                          <p className="text-gray-500">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredManagers.map((manager, index) => (
                      <tr
                        key={manager.id || index}
                        className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50/50 transition-all duration-300 ${
                          index % 2 === 0 ? "bg-white/60" : "bg-emerald-50/30"
                        }`}
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {manager.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 leading-tight">{manager.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                    ID: {manager.id || "N/A"}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                                    Manager
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">{manager.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">{manager.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              <span className="text-sm text-gray-600 max-w-xs truncate" title={manager.address}>
                                {manager.address}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {(manager.team ?? []).slice(0, 4).map((member, idx) => (
                                  <div key={member.name + idx} className="relative group">
                                    <img
                                      src={member.avatar || "/placeholder.svg"}
                                      alt={member.name}
                                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform duration-200 cursor-pointer"
                                      style={{ zIndex: 10 - idx }}
                                      title={`${member.name} - ${member.role}`}
                                    />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                                      <div className="font-semibold">{member.name}</div>
                                      <div className="text-gray-300">{member.role}</div>
                                    </div>
                                  </div>
                                ))}
                                {manager.team && manager.team.length > 4 && (
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs font-medium text-emerald-700 shadow-sm">
                                    +{manager.team.length - 4}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {manager.team?.length || 0} member{(manager.team?.length || 0) !== 1 ? "s" : ""}
                              </span>
                            </div>
                            {manager.team && manager.team.length > 0 && (
                              <div className="w-full bg-emerald-200/50 rounded-full h-2 shadow-inner">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-2 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                                  style={{ width: `${Math.min((manager.team.length / 10) * 100, 100)}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button className="group inline-flex items-center justify-center w-10 h-10 text-teal-600 hover:text-white bg-teal-50 hover:bg-gradient-to-r hover:from-teal-500 hover:to-teal-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1">
                              <Eye className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            </button>
                            <button className="group inline-flex items-center justify-center w-10 h-10 text-amber-600 hover:text-white bg-amber-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1">
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
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-100 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{managers.length}</div>
                  <div className="text-sm text-gray-600">Total Managers</div>
                </div>
                <div className="w-px h-12 bg-emerald-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{filteredManagers.length}</div>
                  <div className="text-sm text-gray-600">Filtered Results</div>
                </div>
                <div className="w-px h-12 bg-emerald-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {managers.reduce((acc, manager) => acc + (manager.team?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Team Members</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">SyTestem Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
