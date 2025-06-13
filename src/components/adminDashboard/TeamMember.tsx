"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Plus, RefreshCw, Users } from 'lucide-react'
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
        if (Array.isArray(res.data)) {
          setTeamMembers(res.data)
        } else {
          setTeamMembers([res.data])
        }
      } catch (e) {
        setTeamMembers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member =>
      (member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (member.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )
  }, [teamMembers, searchTerm])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-6">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800 p-3 rounded-lg shadow-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Team Members
                </h1>
                <p className="text-gray-600 mt-1">Manage and track all team members</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold shadow hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                onClick={() => router.push("/dashboard/admin/addemployee")}
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
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
                  placeholder="Search employees by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                />
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading
                    ? Array(3).fill(0).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          {Array(5).fill(0).map((_, i) => (
                            <td key={i} className="px-6 py-4">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                          ))}
                        </tr>
                      ))
                    : filteredMembers.map((member, idx) => (
                      <tr key={member.id || idx} className="hover:bg-gray-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <div className="text-gray-800 text-base">{member.id || "-"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 text-lg">{member.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{member.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{member.phone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{member.address}</span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}