"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { User, Mail, Phone, Loader2, KeyRound, MapPin, Building2 ,UserPlus, Sparkles } from "lucide-react"
import axiosInstance from "@/lib/axios"
import { colors } from "@/colors"
import { useAuth } from '@/context/AuthContext'
import { getOrganizations } from "@/lib/organizationService"
import { createadmin,type AdminData } from "@/lib/superAdminService"
const AddAdmin: React.FC = () => {
  const { token } = useAuth();
  const [organizations, setOrganizations] = useState([])
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    organization:"",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
//fetc the Organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const data = await getOrganizations()
        setOrganizations(data)
      }
      catch (error) {
        throw error;
      }
    }
    fetchOrganizations()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // --- API POST handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const payload :AdminData= {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
      role: "admin",
      organization: form.organization,
      industry:form.industry,
    }

    try {
      await createadmin(payload)
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        organization: "",
        industry:"",
      })
      setSuccess("Admin added successfully!")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add admin")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 sm:p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg"
              style={{
                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              }}
          >
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-4xl font-bold bg-clip-text text-transparent mb-3"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Add Admin
          </h1>
          <p className="text-gray-600 text-lg font-medium">Empower your team with strong leadership</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Name & Email */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                    }}
                  >
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
                    placeholder="Enter admin full name"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                    style={{
                      '--tw-ring-color': `${colors.primary.hex}33`,
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary.hex;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary.hex}0D, ${colors.secondary.hex}0D)`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${colors.secondary.hex}, ${colors.accent.hex})`,
                    }}
                  >
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
                    placeholder="admin@company.com"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                    style={{
                      '--tw-ring-color': `${colors.secondary.hex}33`,
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.secondary.hex;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, ${colors.secondary.hex}0D, ${colors.accent.hex}0D)`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${colors.accent.hex}, ${colors.primary.hex})`,
                    }}
                  >
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
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                    style={{
                      '--tw-ring-color': `${colors.accent.hex}33`,
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.accent.hex;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, ${colors.accent.hex}0D, ${colors.primary.hex}0D)`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.accent.hex})`,
                    }}
                  >
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
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                    style={{
                      '--tw-ring-color': `${colors.primary.hex}33`,
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary.hex;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary.hex}0D, ${colors.accent.hex}0D)`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${colors.secondary.hex}, ${colors.primary.hex})`,
                    }}
                  >
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
                    placeholder="Admin's address"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300"
                    style={{
                      '--tw-ring-color': `${colors.secondary.hex}33`,
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.secondary.hex;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, ${colors.secondary.hex}0D, ${colors.primary.hex}0D)`,
                    }}
                  ></div>
                </div>
              </div>

           <div className="group">
  <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
    <div
      className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
      style={{
        background: `linear-gradient(to right, ${colors.accent.hex}, ${colors.secondary.hex})`,
      }}
    >
      <Building2 className="w-4 h-4 text-white" />
    </div>
    <span className="text-lg">Organization</span>
  </label>
  <div className="relative">
    <select
      name="organization"
      value={form.organization}
      onChange={handleChange}
      required
      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md focus:ring-4 transition-all duration-300"
      style={{
        '--tw-ring-color': `${colors.accent.hex}33`,
      } as React.CSSProperties}
    >
      <option value="">Select organization</option>
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
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
              <div
                className="border-2 rounded-2xl p-4 text-center"
                style={{
                  backgroundColor: `${colors.accent.hex}1A`,
                  borderColor: `${colors.accent.hex}40`,
                }}
              >
                <div
                  className="font-semibold text-lg flex items-center justify-center space-x-2"
                  style={{ color: colors.accent.hex }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative overflow-hidden text-white font-bold py-4 px-12 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-lg transform hover:scale-105 active:scale-95 min-w-[200px]"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = `linear-gradient(to right, ${colors.primary.hex}E6, ${colors.secondary.hex}E6, ${colors.accent.hex}E6)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`;
                  }
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary.hex}33, ${colors.secondary.hex}33, ${colors.accent.hex}33)`,
                  }}
                ></div>
                <div className="relative flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-6 h-6 mr-3" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Add Admin</span>
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

export default AddAdmin