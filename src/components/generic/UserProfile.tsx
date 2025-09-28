"use client"
import React, { useState, useEffect, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { Sparkles, Loader2, Trash2, Save, Camera, Upload } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { colors } from "@/colors"
import { getEmployeeById, updateTeamMember } from "@/lib/TeamService"


type UserProfileProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  // Modal mount logic
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", onKey);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Reset form when opened
  useEffect(() => {
    if (!isOpen) return;
    setSuccess(null);
    setError(null);
    setSelectedFile(null);
  }, [isOpen]);

  // Overlay click to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageSelect = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Create FormData for multipart form data
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('phone', form.phone)
      formData.append('address', form.address)
      formData.append('email', form.email)
      
      // Add avatar if selected
      if (selectedFile) {
        formData.append('avatar', selectedFile)
      }

      // Call your update API with FormData
      await updateTeamMember(user.id, formData)

      setSuccess("Profile updated successfully!")
      setSelectedFile(null) // Clear selected file after successful upload
    } catch (err) {
      console.error("Update error:", err)
      setError("Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm"
    >
      {loading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      ) : (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[80vh] rounded-3xl border overflow-y-auto custom-scrollbar shadow-2xl p-8"
          style={{
            background: "rgba(0,0,0,0.55)",
            borderColor: "#FFFFFF26",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
          }}
        >
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 8px; background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 8px; border: 2px solid rgba(255,255,255,0.08); }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
            .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
          `}</style>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.white.hex }}>
              Profile Settings
            </h1>
            <p className="text-lg font-medium text-gray-300">
              Manage your account details and preferences
            </p>
          </div>

          {/* Avatar, Name & Email in one row */}
          <div className="flex items-center gap-8 mb-8">
            <div className="relative">
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
              {/* Upload button overlay */}
              <button
                type="button"
                onClick={handleImageSelect}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 group"
              >
                <div className="flex flex-col items-center text-white">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">Change</span>
                </div>
              </button>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {/* Name & Email as plain text */}
            <div className="flex-1">
              <div className="flex flex-col justify-center h-full">
                <div className="text-2xl font-bold text-white mb-2">{form.name || "-"}</div>
                <div className="text-base text-gray-300">{form.email || "-"}</div>
              </div>
            </div>
          </div>

          {/* Form with proper spacing */}
          <div className="max-w-2xl mx-auto">
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email in one row */}
              <div className="flex gap-6">
                <div className="group w-1/2">
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
                <div className="group w-1/2">
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
      )}
    </div>,
    document.body
  );
}