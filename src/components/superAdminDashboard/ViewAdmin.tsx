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
  setIsLoading(true);
  try {
    const res = await axiosInstance.get("/user?role=admin");
    let managersData: Manager[] = [];

    if (Array.isArray(res.data) && Array.isArray(res.data[0])) {
      managersData = res.data[0]; // actual admins array
    } else if (Array.isArray(res.data)) {
      managersData = res.data;
    } else {
      managersData = [res.data];
    }

    setManagers(managersData);
  } catch (e) {
    console.error("Error fetching managers:", e);
    setManagers([]);
  } finally {
    setIsLoading(false);
  }
};


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
            Admin View
          </h1>
          <p
            className="text-lg"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Manage and track all admins
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
                placeholder="Search admins by name, email or ID..."
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
                <span className="font-semibold" style={{ color: colors.primary.hex }}>{filteredManagers.length}</span> of {managers.length} admins
              </div>
              <button
                type="button"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                  color: '#fff',
                  border: `1px solid ${colors.primary.hex}`,
                }}
                onClick={() => router.push("/dashboard/superadmin/addadmin")}
              >
                <Plus className="w-4 h-4" style={{ color: colors.highlight.hex }} />
                Add Admin
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
              <p className="text-lg" style={{ color: colors.primary.hex }}>Loading admins...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: colors.primary.hex }}>
                <thead style={{ background: colors.accent.hex }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Admin Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Contact Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredManagers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-600 text-lg font-medium mb-1">No admin found</p>
                          <p className="text-slate-500">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedManagers.map((manager, index) => (
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

                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" style={{ background: colors.highlight.hex, color: colors.primary.hex }}>
                                    Admin
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
                          <div className="flex items-center gap-2">

                            <button
                              onClick={() => handleEditClick(manager)}
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1"
                              style={{
                                background: colors.highlight.hex,
                                color: colors.primary.hex,
                              }}
                            >
                              <Edit className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            </button>
                            <button
                              onClick={() => handleDelete(manager.id)}
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Edit Admin</h2>

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
                  <div className="text-sm">Total Admins</div>
                </div>
                <div className="w-px h-12" style={{ background: colors.accent.hex }}></div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{filteredManagers.length}</div>
                  <div className="text-sm">Filtered Results</div>
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