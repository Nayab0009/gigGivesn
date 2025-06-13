"use client"
import React, { useState } from "react"
import { User, Mail, Phone, Loader2, KeyRound, MapPin, Building2 } from "lucide-react"
import axiosInstance from "@/lib/axios"

const AddManager: React.FC = () => {
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

    // Always pass role as "manger" (spelling as per backend)
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
      role: "manger",
      organization: Number(form.organization)
    }

    try {
      const response = await axiosInstance.post("/user", payload)
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        organization: ""
      })
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add manager")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Manager</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                  <User className="w-5 h-5 text-black" />
                  <span>Name</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Manager's full name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-black" />
                  <span>Email</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="example@company.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-black" />
                  <span>Password</span>
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-black" />
                  <span>Phone</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 (555) 123-4567"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Address & Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-black" />
                  <span>Address</span>
                </label>
                <input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="Address"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-black" />
                  <span>Organization ID</span>
                </label>
                <input
                  name="organization"
                  type="number"
                  value={form.organization}
                  onChange={handleChange}
                  required
                  placeholder="Organization ID"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center bg-black text-white font-semibold py-4 px-8 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6 mr-3" />
                    Adding...
                  </>
                ) : (
                  <>
                    <User className="w-6 h-6 mr-3" />
                    Add Manager
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddManager