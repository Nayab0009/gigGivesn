"use client"
import { useState, useEffect } from "react"
import { Sparkles, Loader2, Trash2, Save } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { colors } from "@/colors"
import { getEmployeeById,updateTeamMember } from "@/lib/TeamService"


interface UserProfileProps {
  onClose: () => void
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!user?.id) return
      try {
        const res = await getEmployeeById(user.id)
        if (res) {
          setForm({
            name: res.name || "",
            email: res.email || "",
            phone: res.phone || "",
            address: res.address || "",
          })
          if (res.avatar) {
            setImagePreview(res.avatar)
          } else if (res.name) {
            setImagePreview(null)
          }
        }
      } catch (err) {
        console.log("Error loading employee profile", err)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployee()
  }, [user?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!user?.id) return

  setIsSubmitting(true)
  setError(null)
  setSuccess(null)

  try {
    // Call your update API
    await updateTeamMember(user.id, {
      name: form.name,
      phone: form.phone,
      address: form.address,
      // Email usually doesn't change, but you can include it if your backend accepts
      email: form.email,
    })

    setSuccess("Profile updated successfully!")
  } catch (err) {
    console.error("Update error:", err)
    setError("Failed to update profile")
  } finally {
    setIsSubmitting(false)
  }
}


  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="m-5 inset-0 z-50 flex items-center justify-center  backdrop-blur-lg p-4">
      <div className="relative w-full max-w-3xl bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Close */}
    

        {/* Content Container with proper spacing */}
        <div className="px-10 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.white.hex }}>
              Profile Settings
            </h1>
            <p className="text-lg font-medium text-gray-300">
              Manage your account details and preferences
            </p>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="h-32 w-32 rounded-full flex items-center justify-center bg-gray-700 text-white text-3xl font-bold overflow-hidden shadow-lg">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                form.name.charAt(0) || "?"
              )}
            </div>
          </div>

          {/* Form with proper spacing */}
          <div className="max-w-2xl mx-auto">
            {/* Action Buttons - Top */}
            <div className="flex justify-center gap-4 mb-6">
             
             
            </div>

            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="group">
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="group">
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Phone
                </label>
                <input
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0999888888"
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                />
              </div>

              {/* Address */}
              <div className="group">
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Address
                </label>
                <input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                />
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="text-green-400 text-center">{success}</div>
              )}
              {error && (
                <div className="text-red-400 text-center">{error}</div>
                          )}
                          
                           <button
                type="submit"
                form="profile-form"
                disabled={isSubmitting}
                className="px-8 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </form>

            {/* Delete Account Section */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Delete Account</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                After deleting your account you will lose all related information including tasks, projects, notes etc. You will not be able to recover it later, so think twice before doing this.
              </p>
              <button
                type="button"
                className="px-6 py-2 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}