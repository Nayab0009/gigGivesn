"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, RefreshCw, AlertCircle, Edit, Trash2, X, Save, Bold } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteEmployee, updateTeamMember } from "@/lib/TeamService"
import { ShowEmployee } from "@/lib/TeamService"
import { colors } from "@/colors"
import Pagination from "../pagination"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import TeamMemberModal from "@/components/common/TeamMemberModal"


interface TeamMember {
  id?: string | number
  name: string
  email: string
  phone: string
  address: string
  role?: string
}

interface EditingMember extends TeamMember {
  originalData: TeamMember
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
  const [editingMember, setEditingMember] = useState<EditingMember | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const router = useRouter()
  const { user } = useAuth()
  const userRole = user?.role?.toLowerCase()

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    setCurrentPage(1)
  }, [teamMembers])

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const res = await ShowEmployee("employee")
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

  useEffect(() => {
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

  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Form validation function
  const isFormValid = () => {
    if (!editingMember) return false

    return (
      editingMember.name.trim() !== "" &&
      editingMember.email.trim() !== "" &&
      editingMember.email.includes("@") &&
      editingMember.phone.trim() !== "" &&
      editingMember.address.trim() !== ""
    )
  }
  const handleOpenDetails = (member: TeamMember) => {
    console.log('Selected Member Data:', member);
    setSelectedMember(member)
    setIsDetailsOpen(true)
  }
  const handleCloseDetails = () => {
  setSelectedMember(null)
  setIsDetailsOpen(false)
}
  const handleEmployeeDelete = async (teamId: string | number) => {
    if (!teamId) return
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?")
    if (!confirmDelete) return

    try {
      await deleteEmployee(String(teamId))
      setTeamMembers((prev) => {
        const updated = prev.filter((team) => String(team.id) !== String(teamId))
        // If the current page is now empty, go to the previous page (if not on page 1)
        if ((currentPage - 1) * itemsPerPage >= updated.length && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        }
        return updated
      })
    } catch (error) {
      console.error("Error deleting employee:", error)
      alert("Failed to delete employee. Please try again.")
    }
  }

  const handleEditStart = (member: TeamMember) => {
    setEditingMember({
      ...member,
      originalData: { ...member },
    })
  }

  const handleEditCancel = () => {
    setEditingMember(null)
  }

  const handleEditSave = async () => {
    if (!editingMember || !editingMember.id) return

    setIsUpdating(true)
    try {
      const updateData = {
        name: editingMember.name,
        email: editingMember.email,
        phone: editingMember.phone,
        address: editingMember.address,
        role: editingMember.role,
      }
      await updateTeamMember(String(editingMember.id), updateData)

      // Update the local state
      setTeamMembers((prev) =>
        prev.map((member) => (String(member.id) === String(editingMember.id) ? { ...member, ...updateData } : member)),
      )

      setEditingMember(null)
      alert("Employee updated successfully!")
    } catch (error) {
      console.error("Error updating employee:", error)
      alert("Failed to update employee. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = (field: keyof TeamMember, value: string) => {
    if (editingMember) {
      setEditingMember({
        ...editingMember,
        [field]: value,
      })
    }
  }

  return (
    <div className="p-2 sm:p-6 lg:p-8">

      <div className="mx-auto">
        {/* Header */}
     <div className="mb-8 md:flex flex-col  md:flex-row items-center justify-between gap-6">
  {/* Heading Section */}
  <div className="flex flex-col">
    <h1 className="text-2xl sm:text-2xl font-medium text-white">Team Members</h1>
    <p className="text-white" style={{fontWeight: 100}}>Manage and track all team members</p>
  </div>

  {/* Action Bar */}
  <div className="md:flex md:flex-1 items-center gap-6 w-full lg:w-auto justify-between mt-5 md:mt-0 md:ml-20 space-y-4">
    {/* Search Bar */}
  <div className="relative block sm:flex flex-1 max-w-md w-full">
  <Search
    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
    style={{ color: colors.accent.hex }}
  />
 <input
  type="text"
  placeholder="Search employees by name, email or ID..."
  className="w-full pl-10 pr-4 py-3 rounded-full focus:ring-2 transition-all duration-300 shadow-lg focus:shadow-xl text-white focus:outline-none"
  style={{
    background: "rgba(0, 0, 0, 0.4)", 
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)", 
  }}
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>


</div>



    {/* Stats Badge */}
    <div
      className="text-sm px-4 py-2 rounded-full text-white border border-[#0CA9F6] inline mr-5"
  
    >
      <span className="font-semibold" >
        {filteredMembers.length}
      </span>{" "}
      of {teamMembers.length} employees
    </div>

    {/* Add Button (only for managers) */}
    {userRole === "manager" && (
      <button
        type="button"
        className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 mt-4 sm:mt-0"
        style={{
          background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
          color: "#fff",
          border: `1px solid ${colors.primary.hex}`,
        }}
        onClick={() => router.push("/dashboard/admin/addemployee")}
      >
        <Plus className="w-4 h-4" />
        Add Employee
      </button>
    )}
  </div>
</div>

        {/* Edit Modal */}
       {editingMember && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div
      className="rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide transform transition-all duration-300 scale-100"
      style={{
        background: "rgba(255, 255, 255, 0.08)", // glassy modal bg
        border: `2px solid ${colors.primary.hex}40`,
      }}
    >
      {/* Header */}
      <div
        className="px-8 py-6  relative overflow-hidden rounded-t-3xl"
        style={{
          background: `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
          color: "#fff",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Edit Team Member</h2>
            <p className="text-white/80 text-sm">Update employee information</p>
          </div>
          <button
            onClick={handleEditCancel}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-6 space-y-6 text-white">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: colors.primary.hex }}></div>
            Full Name *
          </label>
          <input
            type="text"
            value={editingMember.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all duration-300 font-medium bg-transparent text-white placeholder-gray-300"
            style={{
              borderColor: editingMember.name.trim() ? colors.primary.hex : "#ef4444",
            }}
            placeholder="Enter full name"
          />
          {!editingMember.name.trim() && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Name is required
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: colors.secondary.hex }}></div>
            Email Address *
          </label>
          <input
            type="email"
            value={editingMember.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all duration-300 font-medium bg-transparent text-white placeholder-gray-300"
            style={{
              borderColor:
                editingMember.email.trim() && editingMember.email.includes("@")
                  ? colors.primary.hex
                  : "#ef4444",
            }}
            placeholder="Enter email address"
          />
          {(!editingMember.email.trim() || !editingMember.email.includes("@")) && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Valid email is required
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: colors.accent.hex }}></div>
            Phone Number *
          </label>
          <input
            type="tel"
            value={editingMember.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all duration-300 font-medium bg-transparent text-white placeholder-gray-300"
            style={{
              borderColor: editingMember.phone.trim() ? colors.primary.hex : "#ef4444",
            }}
            placeholder="Enter phone number"
          />
          {!editingMember.phone.trim() && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Phone number is required
            </p>
          )}
        </div>

        {/* Address Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: colors.highlight.hex }}></div>
            Address *
          </label>
          <textarea
            value={editingMember.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none resize-none transition-all duration-300 font-medium bg-transparent text-white placeholder-gray-300"
            style={{
              borderColor: editingMember.address.trim() ? colors.primary.hex : "#ef4444",
            }}
            placeholder="Enter complete address"
          />
          {!editingMember.address.trim() && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Address is required
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-8 py-6  rounded-b-3xl flex gap-4"
        style={{
          background: `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
          borderColor: `${colors.primary.hex}40`,
        }}
      >
        <button
          onClick={handleEditCancel}
          className="flex-1 px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 transform hover:scale-105 text-white"
          style={{
            borderColor: "#fff",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleEditSave}
          disabled={isUpdating || !isFormValid()}
          className="flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
          }}
        >
          {isUpdating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}


{/* Table Container */}
<div
  className="rounded-2xl  shadow-2xl overflow-hidden backdrop-blur-xl"
 
>
  {isLoading ? (
    <div className="p-12 text-center">
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 backdrop-blur-xl "
        style={{ 
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)"
        }}
      >
        <RefreshCw className="w-6 h-6 animate-spin text-white" />
      </div>
      <p className="text-lg text-white">
        Loading team members...
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-4 bg-black/30 px-5">
        <thead className="text-white rounded-t-2xl h-[32px]">
          <tr className="h-[60px]">
            <th className="px-6 text-left text-sm font-medium text-white/90 w-[35%]">
              Employee Details
            </th>
            <th className="px-6 text-left text-sm font-medium text-white/90 w-[25%]">
              Role
            </th>
            <th className="px-6 text-left text-sm font-medium text-white/90 w-[25%]">
              Contact Info
            </th>
            {userRole === "manager" && (
              <th className="px-6 text-right text-sm font-medium text-white/90 w-[15%] pr-[50px]">
                Actions
              </th>
            )}
          </tr>
        </thead>


<tbody className="text-white rounded-b-2xl">
  {paginatedMembers.length === 0 ? (
    <tr>
      <td colSpan={4} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-white/80" />
          </div>
          <p className="text-white text-lg font-medium mb-1">
            No team members found
          </p>
          <p className="text-white/70">Try adjusting your search criteria</p>
        </div>
      </td>
    </tr>
  ) : (
    paginatedMembers.map((member, index) => (
      
      <tr
        key={member.id || index}
        className="transition-all duration-30"
        style={{ 
      
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.1)",
          outline: "none",
        }}
         onClick={() => handleOpenDetails(member)}
      >
        
        {/* Employee Details Cell */}
        

 <td className="px-6 py-5 rounded-l-xl" style={{ background: "transparent", border: "none" }}>
  <div className="flex items-center gap-3">
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center font-semibold text-sm shadow-lg backdrop-blur-xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
        color: "#fff",
      }}
    >
      {member.avatar ? (
        <Image
          src={member.avatar}
          alt={member.name}
          width={80}
          height={80}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        member.name.charAt(0).toUpperCase()
      )}
    </div>
    <div>
      <h3 className="text-base font-semibold text-white">{member.name}</h3>
      <p className="text-sm text-blue-400">Team Member</p>
    </div>
  </div>
</td>



        {/* Role Cell */}

        <td className="px-6 py-5" style={{ background: "transparent", border: "none" }}>
          <span className="text-sm text-white/80 capitalize font-medium">
            {member.role || "Employee"}
          </span>
        </td>

        {/* Contact Info Cell */}

        <td className={`px-6 py-5 ${userRole !== 'manager' ? 'rounded-r-xl' : ''}`} style={{ background: "transparent", border: "none" }}>
          <div className="space-y-1">
            <div className="text-sm text-white/90 font-medium">{member.email}</div>
            {member.phone && (
              <div className="text-xs text-white/70">{member.phone}</div>
            )}
            {member.address && (
              <div
                className="text-xs text-white/70 truncate max-w-xs"
                title={member.address}
              >
                {member.address}
              </div>
            )}
          </div>
        </td>

        {/* Actions Cell (Manager Only) */}
        {userRole === "manager" && (
          <td className="px-6 py-5 rounded-r-xl" style={{ background: "transparent", border: "none" }}>
            <div className="flex items-center justify-end gap-2">
              {/* <button
                onClick={() => handleEditStart(member)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:bg-white/10 backdrop-blur-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Edit className="w-4 h-4 text-white/70" />
              </button> */}
              <button
                onClick={() => handleEmployeeDelete(String(member.id))}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:bg-red-500/20 backdrop-blur-xl"
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </td>
          
        )}
      </tr>
    ))
  )}
</tbody>


      </table>
    </div>
  )}
</div>
        {/* Pagination */}
        {!isLoading && filteredMembers.length > itemsPerPage && (
          <div className="flex justify-center my-6">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(Math.ceil(filteredMembers.length / itemsPerPage), 1)}
              onPageChange={setCurrentPage}
              colors={colors}
            />
          </div>
        )}

        {/* Summary Footer */}
        {!isLoading && (
          <div
  className="mt-8 rounded-2xl shadow-lg border p-6 text-white backdrop-blur-xl"
  style={{
    background: "rgba(50, 50, 50, 0.35)", // glassy dark gray
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.1)", // subtle border
  }}
>
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div className="flex items-center gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold">{teamMembers.length}</div>
        <div className="text-sm text-white/70">Total Employees</div>
      </div>
      <div className="w-px h-12 bg-white/20"></div>
      <div className="text-center">
        <div className="text-2xl font-bold">{filteredMembers.length}</div>
        <div className="text-sm text-white/70">Filtered Results</div>
      </div>
      <div className="w-px h-12 bg-white/20"></div>
      <div className="text-center">
        <div className="text-2xl font-bold">
          {teamMembers.filter((member) => member.role?.toLowerCase() === "employee").length}
        </div>
        <div className="text-sm text-white/70">Active Employees</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full animate-pulse"
        style={{ background: colors.highlight.hex }}
      ></div>
      <span className="text-sm text-white/70">System Active</span>
    </div>
  </div>
</div>

        )}
      </div>
     {isDetailsOpen && selectedMember && (
        <TeamMemberModal
          teamMember={{
            ...selectedMember,  // Spread all properties from the selected member
            id: selectedMember.id?.toString(),
            team: [{
              name: selectedMember.name,
              avatar: generateAvatar(selectedMember.name, 0)
            }]
          }}
          onClose={handleCloseDetails}
          generateAvatar={generateAvatar}
        />
      )}
    </div>
    
  )
}