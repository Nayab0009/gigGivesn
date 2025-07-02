"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Plus, RefreshCw, Edit, Trash2, Eye, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import { colors } from "@/colors"

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
    <div className="p-4 sm:p-6 lg:p-8">
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
            Managers Dashboard
          </h1>
          <p
            className="text-lg"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Manage and track all project managers
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
                placeholder="Search managers by name, email or ID..."
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
                <span className="font-semibold" style={{ color: colors.primary.hex }}>{filteredManagers.length}</span> of {managers.length} managers
              </div>
              <button
                type="button"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                  color: '#fff',
                  border: `1px solid ${colors.primary.hex}`,
                }}
                onClick={() => router.push("/dashboard/admin/addmanager")}
              >
                <Plus className="w-4 h-4" style={{ color: colors.highlight.hex }} />
                Add Manager
              </button>
              <button
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                style={{
                  background: '#fff',
                  color: colors.primary.hex,
                  border: `1px solid ${colors.primary.hex}`,
                }}
                onClick={handleRefresh}
                disabled={isLoading}
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
              <p className="text-lg" style={{ color: colors.primary.hex }}>Loading managers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: colors.primary.hex }}>
                <thead style={{ background: colors.accent.hex }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Manager Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Contact Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Team Members</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredManagers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-600 text-lg font-medium mb-1">No managers found</p>
                          <p className="text-slate-500">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredManagers.map((manager, index) => (
                      <tr
                        key={manager.id || index}
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
                                {manager.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold leading-tight" style={{ color: colors.primary.hex }}>{manager.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" style={{ background: colors.accent.hex, color: colors.primary.hex }}>
                                    ID: {manager.id || "N/A"}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" style={{ background: colors.highlight.hex, color: colors.primary.hex }}>
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
                              <div className="w-2 h-2 rounded-full" style={{ background: colors.primary.hex }}></div>
                              <span className="text-sm font-medium" style={{ color: colors.primary.hex }}>{manager.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: colors.secondary.hex }}></div>
                              <span className="text-sm" style={{ color: colors.secondary.hex }}>{manager.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: colors.accent.hex }}></div>
                              <span className="text-sm max-w-xs truncate" title={manager.address} style={{ color: colors.accent.hex }}>
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
                                  <div className="w-8 h-8 rounded-full" style={{ background: colors.accent.hex, color: colors.primary.hex, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 500, border: `2px solid #fff` }}>
                                    +{manager.team.length - 4}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm" style={{ color: colors.secondary.hex }}>
                                {manager.team?.length || 0} member{(manager.team?.length || 0) !== 1 ? "s" : ""}
                              </span>
                            </div>
                            {manager.team && manager.team.length > 0 && (
                              <div className="w-full rounded-full h-2 shadow-inner" style={{ background: colors.accent.hex }}>
                                <div
                                  className="h-2 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                                  style={{
                                    background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                                    width: `${Math.min((manager.team.length / 10) * 100, 100)}%`,
                                  }}
                                >
                                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, #fff3, transparent)', animation: 'pulse 2s infinite' }}></div>
                                </div>
                              </div>
                            )}
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
                  <div className="text-2xl font-bold">{managers.length}</div>
                  <div className="text-sm">Total Managers</div>
                </div>
                <div className="w-px h-12" style={{ background: colors.accent.hex }}></div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{filteredManagers.length}</div>
                  <div className="text-sm">Filtered Results</div>
                </div>
                <div className="w-px h-12" style={{ background: colors.accent.hex }}></div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {managers.reduce((acc, manager) => acc + (manager.team?.length || 0), 0)}
                  </div>
                  <div className="text-sm">Team Members</div>
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
