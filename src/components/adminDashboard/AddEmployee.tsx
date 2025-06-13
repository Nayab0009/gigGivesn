"use client"
import React, { useState } from "react"
import { User, Mail, Phone, Loader2, KeyRound, MapPin, Building2, UserPlus, Sparkles } from "lucide-react"
import axiosInstance from "@/lib/axios"

const AddEmployee: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    organization: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // --- API POST handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    // Always pass role as "employee"
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
      role: "employee",
      organization: Number(form.organization)
    }

    try {
      await axiosInstance.post("/user", payload)
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        organization: ""
      })
      setSuccess("Employee added successfully!")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add employee")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4 sm:p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl mb-6 shadow-lg">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-3">
            Add New Employee
          </h1>
          <p className="text-gray-600 text-lg font-medium">Build your team with talented individuals</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Name & Email */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Full Name</span>
                </label>
                <div className="relative">
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter employee's full name"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Email Address</span>
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="employee@company.com"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm">
                    <KeyRound className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Password</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Create secure password"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Phone Number</span>
                </label>
                <div className="relative">
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (555) 123-4567"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Address & Organization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Address</span>
                </label>
                <div className="relative">
                  <input
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="Employee's address"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Organization ID</span>
                </label>
                <div className="relative">
                  <input
                    name="organization"
                    type="number"
                    value={form.organization}
                    onChange={handleChange}
                    required
                    placeholder="Enter organization ID"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Error or Success Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                <div className="text-red-700 font-semibold text-lg">{error}</div>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                <div className="text-green-700 font-semibold text-lg flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-7 h-7 mr-3" />
                      <span>Adding Employee...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-7 h-7 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Add Employee</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEmployee