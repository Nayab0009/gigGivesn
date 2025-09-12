"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Plus, RefreshCw, Edit, Trash2, Eye, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import { colors } from "@/colors"
import { deleteManager } from "@/lib/ManagerService"
import { updateManager } from "@/lib/ManagerService"
import Pagination from "../pagination"

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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editManager, setEditManager] = useState<Manager | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [editFormErrors, setEditFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setEditFormErrors(prev => ({
      ...prev,
      [e.target.name]: '',
    }));
  };

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

  // Calculate pagin
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedManagers = filteredManagers.slice(startIndex, endIndex)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const handleEditClick = (manager: Manager) => {
    setEditManager(manager);
    setEditForm({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      address: manager.address,
    });
    setEditFormErrors({ name: '', email: '', phone: '', address: '' });
    setShowEditModal(true);
  };

  const handleUpdateManager = async () => {
    if (!editManager?.id) return;
    // Validate fields
    const errors: typeof editFormErrors = { name: '', email: '', phone: '', address: '' };
    let hasError = false;
    if (!editForm.name.trim()) {
      errors.name = 'Name is required.';
      hasError = true;
    }
    if (!editForm.email.trim()) {
      errors.email = 'Email is required.';
      hasError = true;
    }
    if (!editForm.phone.trim()) {
      errors.phone = 'Phone is required.';
      hasError = true;
    }
    if (!editForm.address.trim()) {
      errors.address = 'Address is required.';
      hasError = true;
    }
    setEditFormErrors(errors);
    if (hasError) return;
    setIsUpdating(true);
    try {
      await updateManager(editManager.id, editForm);
      setManagers(prev => prev.map(m => m.id === editManager.id ? { ...m, ...editForm } : m));
      setShowEditModal(false);
    } catch (err) {
      alert("Failed to update manager.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (managerId: string|undefined) => {
    if (!managerId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this manager?");
    if (!confirmDelete) return;
    try {
      await deleteManager(managerId);
      setManagers((prev) => prev.filter((manager) => manager.id !== managerId));
    } catch (error) {
      console.error("Error deleting manager:", error);
      alert("Failed to delete manager. Please try again.");
    }
  }

  return (
  <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header & Action Bar (improved layout) */}
        <div className="mb-8 flex items-center justify-between gap-4">
          {/* Left: Heading */}
          <div className="flex flex-col gap-1 md:gap-2 justify-center flex-shrink-0" style={{ minWidth: 220 }}>
            <h1
              className="font-bold text-white font-sans not-italic text-2xl leading-9 tracking-normal [font-family:Montserrat,sans-serif] [font-weight:700] [vertical-align:middle] [background-clip:text]"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontStyle: 'normal',
                fontSize: '20px',
                lineHeight: '36px',
                letterSpacing: '0px',
                WebkitBackgroundClip: 'text',
                verticalAlign: 'middle',
              }}
            >
              Managers Dashboard
            </h1>
            <p
              className="font-normal align-middle text-white font-sans not-italic text-sm leading-5 tracking-normal [font-family:Montserrat,sans-serif] [font-weight:400] [background-clip:text]"
            >
              Manage and track all project managers
            </p>
          </div>
          {/* Center: Search */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-lg" style={{ marginLeft: '90px' }}>
              <Search
                className="absolute text-[#9CA3AF] left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search manager by name, email or ID"
                className="w-[396px] h-[38px] rounded-[16px] border border-[#FFFFFF4D] bg-[#0000004D] opacity-100 px-[41px] py-[9px]   pr-[17px] text-[#9CA3AF] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]/30 transition-all duration-300 shadow-sm mx-auto"
                style={{
                  borderWidth: 1,
                  background: '#0000004D',
                  borderColor: '#FFFFFF4D',
                  borderRadius: '16px',
                  paddingTop: '9px',
                  paddingBottom: '9px',
                  paddingLeft: '41px',
                  paddingRight: '17px',
                  height: '38px',
                  width: '396px',
                  opacity: 1,
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Right: 3 Buttons */}
          <div className="flex flex-row items-center gap-2 md:gap-3 flex-shrink-0">
            <div
              className="text-xs text-white sm:text-sm px-[24px] py-[8px] rounded-full border bg-[#0000004D] border-[#FFFFFF4D] opacity-100  focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]/30 transition-all duration-300 shadow-sm flex items-center"
              style={{
                borderWidth: 1,
                background: '#0000004D',
                borderColor: '#FFFFFF4D',
                opacity: 1,
              }}
            >
              <span className="font-semibold text-white" >{filteredManagers.length}</span>
              <span className="mx-1">of</span>
              {managers.length} Managers
            </div>
            <button
              type="button"
              className="text-xs text-white sm:text-sm px-[24px] py-[8px] rounded-full border bg-[#0000004D] border-[#FFFFFF4D] opacity-100 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]/30 transition-all duration-300 shadow-sm inline-flex items-center gap-2 font-medium group hover:shadow-lg transform hover:scale-105"
              style={{
                borderWidth: 1,
                background: '#0000004D',
                borderColor: '#FFFFFF4D',
                opacity: 1,
              }}
              onClick={() => router.push("/dashboard/admin/addmanager")}
            >
              <Plus className="w-4 h-4 text-white"  />
              Add Manager
            </button>
            <button
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
              style={{
                background: colors.primary.hex,
                color: '#fff',
                border: `1px solid ${colors.primary.hex}`,
              }}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 text-white"  />
              Refresh
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="relative">
          {isLoading ? (
            <div className="relative p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ background: colors.accent.hex }}>
                <RefreshCw className="w-6 h-6 animate-spin" style={{ color: colors.primary.hex }} />
              </div>
              <p className="text-lg text-slate-200">Loading managers...</p>
            </div>
          ) : filteredManagers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#ffffff14' }}>
                <AlertCircle className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-200 text-lg font-medium mb-1">No managers found</p>
              <p className="text-slate-400">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedManagers.map((manager, index) => {
                const initials = manager.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                const teamSize = manager.team?.length || 0;
                return (
                  <div
                    key={manager.id || index}
                    className="relative rounded-2xl border overflow-hidden p-5 shadow-2xl backdrop-blur-md"
                    style={{
                      background: '#0000005D',
                      borderColor: '#FFFFFF4D',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                  >
                    {/* Removed decorative gradient overlay to match search bar's solid background style */}

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-lg"
                          style={{
                            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                            color: '#fff',
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-[16px] leading-tight">{manager.name}</h3>
                          <div className="text-xs text-slate-300">Project Manager</div>
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-4 grid grid-cols-2 gap-y-2 text-sm">
                      <div
                        className="text-[#A8A8A8] [font-family:Montserrat,sans-serif] font-normal not-italic text-sm leading-5 tracking-normal align-middle"
                      >
                        Email:
                      </div>
                      <div className="text-right text-white font-medium truncate" title={manager.email}>{manager.email}</div>
                      <div className="text-[#A8A8A8] [font-family:Montserrat,sans-serif] text-[14px] not-italic text-sm leading-5 tracking-normal align-middle">Phone:</div>
                      <div className="text-right text-slate-200 font-medium truncate" title={manager.phone}>{manager.phone}</div>
                      <div className="text-[#A8A8A8] [font-family:Montserrat,sans-serif] font-normal not-italic text-sm leading-5 tracking-normal align-middle">Location:</div>
                      <div className="text-right text-slate-200 font-medium truncate" title={manager.address}>{manager.address}</div>
                      <div className="text-[#A8A8A8] [font-family:Montserrat,sans-serif] font-normal not-italic text-sm leading-5 tracking-normal align-middle">Team Size:</div>
                      <div className="text-right text-white font-medium">{teamSize} members</div>
                    </div>

                    <div className="relative mt-5 flex items-center justify-between">
                      <button
                        className="group inline-flex items-center justify-center gap-2 px-7 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md min-w-[130px] text-center"
                        style={{
                          background: '#0CA9F6',
                          color: '#fff',
                          border: `1px solid ${colors.primary.hex}`,
                          minWidth: '250px',
                          textAlign: 'center',
                        }}
                        onClick={() => {}}
                      >
                        View Details
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(manager.id)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
                          style={{ background: '#0000004D', border: '1px solid #FFFFFF4D' }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-slate-200" />
                        </button>
                        <button
                          onClick={() => handleEditClick(manager)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
                          style={{ background: '#0000005D', border: '1px solid #FFFFFF4D' }}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" style={{ color: '#B0B9C6' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && filteredManagers.length > 0 && totalPages > 1 && (
          <div className="flex justify-center my-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              colors={colors}
            />
          </div>
        )}

        {showEditModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-60"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md transition-all">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Edit Manager</h2>

              <div className="space-y-4">
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  placeholder="Name"
                />
                {editFormErrors.name && (
                  <div className="text-red-600 text-xs mt-1">{editFormErrors.name}</div>
                )}
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  placeholder="Email"
                />
                {editFormErrors.email && (
                  <div className="text-red-600 text-xs mt-1">{editFormErrors.email}</div>
                )}
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                  placeholder="Phone"
                />
                {editFormErrors.phone && (
                  <div className="text-red-600 text-xs mt-1">{editFormErrors.phone}</div>
                )}
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditFormChange}
                  placeholder="Address"
                />
                {editFormErrors.address && (
                  <div className="text-red-600 text-xs mt-1">{editFormErrors.address}</div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditFormErrors({ name: '', email: '', phone: '', address: '' });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                  onClick={handleUpdateManager}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

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