// components/UserProfile.tsx
"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, Mail, Phone, MapPin, Sparkles, Loader2, Trash2, Save } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { colors } from "@/colors"

interface UserProfileProps {
  onClose: () => void
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState(user?.image || "/images/profile.svg")

  if (!user) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      // simulate save API
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError("Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg p-4">
      <div className="relative w-full max-w-4xl bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.white.hex }}>
            Profile Settings
          </h1>
          <p className="text-lg font-medium text-gray-300">
            Manage your account details and preferences
          </p>
        </div>

        {/* Avatar Upload */}
        <div className="flex justify-center mb-8">
          <label
            htmlFor="avatar-upload"
            className="w-full max-w-sm border-2 border-dashed border-gray-400 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition bg-black/30"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="mx-auto h-32 w-32 rounded-full object-cover shadow-lg"
            />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
            />
            <p className="mt-3 text-sm text-gray-400">Click to upload new photo</p>
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block mb-2 text-gray-300">First Name</label>
              <input
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="group">
              <label className="block mb-2 text-gray-300">Last Name</label>
              <input
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Phone + Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block mb-2 text-gray-300">Phone</label>
              <input
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="group">
              <label className="block mb-2 text-gray-300">Country</label>
              <input
                name="country"
                type="text"
                value={form.country}
                onChange={handleChange}
                placeholder="Enter country"
                className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                {success}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
