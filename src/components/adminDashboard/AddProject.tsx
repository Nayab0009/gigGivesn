"use client"
import type React from "react"
import { useState } from "react"
import { Loader2, CalendarDays, FileText, Plus, Sparkles,X } from "lucide-react"
import { createProject } from "@/lib/ProjectService"
import { colors } from "@/colors"
// You can install and use react-datepicker for a better UX:
// npm install react-datepicker
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useRouter } from "next/navigation"

const AddProject: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    setLogoFile(file) // store file for backend upload
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
}
  const handleDateChange = (date: Date | null, field: "startDate" | "endDate") => {
    setForm((prev) => ({
      ...prev,
      [field]: date,
    }))
  }

  // --- API POST handler ---
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null)
  setSuccess(null)

  try {
    const formData = new FormData()
    formData.append("name", form.title)
    formData.append("description", form.description)
    if (form.startDate) formData.append("startDate", form.startDate.toISOString())
    if (form.endDate) formData.append("endDate", form.endDate.toISOString())
    if (logoFile) formData.append("logo", logoFile) // 👈 backend expects `logo`

    await createProject(formData)

    setForm({ title: "", description: "", startDate: null, endDate: null })
    setLogoPreview(null)
    setLogoFile(null)

    setSuccess("Project added successfully!")
    setTimeout(() => router.push("/dashboard/admin/projects"), 1200)
  } catch (err: any) {
    setError(err?.response?.data?.message || "Failed to add project")
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ background: colors.primary.rgb, opacity: 0.3 }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: colors.secondary.rgb, opacity: 0.3 }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full blur-3xl"
          style={{ background: colors.accent.rgb, opacity: 0.3 }}
        ></div>
      </div>

      <div className="relative w-full max-w-5xl bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">

       <button
  type="button"
  onClick={() => router.push("/dashboard/admin/projects")}

  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
>
  <X className="w-4 h-4 text-white" />
</button>{/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-3" style={{ color: colors.white.hex }}>
            Add New Project
          </h1>
          <p className=" text-lg font-medium" style={{ color: colors.white.hex }}>Transform your ideas into reality</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Project Logo Upload */}
<div className="flex justify-center mb-8">
  <label className="relative cursor-pointer group">
    <input
      type="file"
      accept="image/*"
      onChange={handleLogoChange} // 👈 you’ll define this function
      className="hidden"
    />
    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center overflow-hidden bg-black/50 group-hover:border-[#0CA9F6] transition-all duration-300">
      {logoPreview ? (
        <img
          src={logoPreview}
          alt="Project Logo Preview"
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-xs">Upload Logo</span>
        </div>
      )}
    </div>
  </label>
</div>

          <div className="space-y-8">
            {/* Project Title */}
            <div className="group">
              <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                <span className="text-md" style={{ color: colors.white.hex }}>Project Title</span>
              </label>
              <div className="relative">
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter your amazing project title..."
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                <span className="text-md" style={{ color: colors.white.hex }}>Project Description</span>
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your project vision, goals, and key features..."
                  rows={5}
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6] resize-none"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Start Date */}
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <span className="text-md" style={{ color: colors.white.hex }}>Start Date <span className="text-sm text-gray-400 font-normal">(optional)</span></span>
                </label>
                <div className="relative">
                  <DatePicker
                    selected={form.startDate}
                    onChange={(date) => handleDateChange(date, "startDate")}
                    className="w-full rounded-lg border border-white/20 bg-black/60 px-12 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]"
                    placeholderText="Select project start date"
                    dateFormat="MMM dd, yyyy"
                    isClearable
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  {/* Calendar Icon inside input */}
                  <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* End Date */}
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <span className="text-md" style={{ color: colors.white.hex }}>End Date <span className="text-sm text-gray-400 font-normal">(optional)</span></span>
                </label>
                <div className="relative">
                  <DatePicker
                    selected={form.endDate}
                    onChange={(date) => handleDateChange(date, "endDate")}
                    className="w-full rounded-lg border border-white/20 bg-black/60 px-12 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]"
                    placeholderText="Select project end date"
                    dateFormat="MMM dd, yyyy"
                    isClearable
                    minDate={form.startDate || undefined}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  {/* Calendar Icon inside input */}
                  <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
            <div className="pt-6 flex justify-center">
            <button
  type="submit"
  disabled={isSubmitting}
  className="group relative overflow-hidden text-white font-bold py-4 px-12 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-lg transform hover:scale-105 active:scale-95 min-w-[200px] border"
  style={{
    backgroundColor: "#0CA9F6",
    border: "1px solid #57B5E7E5",
  }}
>
  <div className="absolute inset-0" style={{ background: colors.accent.rgb, opacity: 0.2 }}></div>
  <div className="relative flex items-center justify-center">
    {isSubmitting ? (
      <>
        <Loader2
          className="animate-spin w-6 h-6 mr-3"
          style={{ color: colors.highlight.hex }}
        />
        <span>Creating...</span>
      </>
    ) : (
      <>

        <span>Create Project</span>
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

export default AddProject