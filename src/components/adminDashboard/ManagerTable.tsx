"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Plus, RefreshCw, Users, Edit, Trash2, Eye } from 'lucide-react'
import { useRouter } from "next/navigation";
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
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/miniavs/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
  ]
  return avatarStyles[index % avatarStyles.length]
}

export default function EnhancedManagersTable() {
  const [isLoading, setIsLoading] = useState(true)
  const [managers, setManagers] = useState<Manager[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter();

  useEffect(() => {
    const fetchManagers = async () => {
      setIsLoading(true)
      try {
        // Simulate fetching managers with teams (mock team data)
        const res = await axiosInstance.get("/user?role=manger")
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
          ].slice(0, Math.floor(Math.random() * 4) + 1)
        }))
        setManagers(managersData)
      } catch (e) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800 p-3 rounded-lg shadow-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Managers Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage and track all project managers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold shadow hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                onClick={() => router.push("/dashboard/admin/addmanager")}
              >
                <Plus className="w-4 h-4" />
                <span>Add Manager</span>
              </button>
              <button className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:border-gray-400 hover:text-gray-800 transition-all duration-300 flex items-center space-x-2 shadow-sm">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                  type="text"
                  placeholder="Search managers by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                />
              </div>
              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 mt-2 lg:mt-0">
                <span className="font-semibold text-gray-800">{filteredManagers.length}</span> of {managers.length} managers
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading
                    ? Array(3).fill(0).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          {Array(7).fill(0).map((_, i) => (
                            <td key={i} className="px-6 py-4">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                          ))}
                        </tr>
                      ))
                    : filteredManagers.map((manager, idx) => (
                      <tr key={manager.id || idx} className="hover:bg-gray-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <div className="text-gray-800 text-base">{manager.id || "-"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 text-lg">{manager.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{manager.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{manager.phone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{manager.address}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex -space-x-2">
                              {(manager.team ?? []).slice(0, 3).map((user, i) => (
                                <div key={user.name + i} className="relative group/avatar">
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full border-2 border-white shadow hover:scale-110 transition-transform duration-200 cursor-pointer"
                                  />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                    <div className="font-semibold">{user.name}</div>
                                    <div className="text-gray-300">{user.role}</div>
                                  </div>
                                </div>
                              ))}
                              {manager.team && manager.team.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-white shadow flex items-center justify-center text-white font-bold text-xs">
                                  +{manager.team.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-1">
                            <button className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 group/btn" title="View Manager">
                              <Eye className="w-4 h-4 text-blue-600 group-hover/btn:text-blue-700" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 group/btn" title="Edit Manager">
                              <Edit className="w-4 h-4 text-gray-600 group-hover/btn:text-gray-700" />
                            </button>
                            <button className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 group/btn" title="Delete Manager">
                              <Trash2 className="w-4 h-4 text-red-500 group-hover/btn:text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
          {/* Summary Footer */}
          {!isLoading && (
            <div className="bg-gray-100 rounded-lg p-4 mt-6 border border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Managers: <span className="font-semibold text-gray-800">{managers.length}</span></span>
                <span>Filtered Results: <span className="font-semibold text-gray-800">{filteredManagers.length}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}