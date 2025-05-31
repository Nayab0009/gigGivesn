"use client"
import React, { useState } from "react"
import { User, Mail, Phone, Image, FolderPlus, Loader2 } from "lucide-react"

type ProjectOption = {
  id: string
  title: string
}

interface AddManagerFormProps {
  // Optionally you can pass the list of available projects here
  projectsList?: ProjectOption[]
  onAdd?: (manager: any) => void
}

const mockProjects: ProjectOption[] = [
  { id: "PRJ-001", title: "E-commerce Platform Redesign" },
  { id: "PRJ-002", title: "Mobile Banking App" },
  { id: "PRJ-003", title: "API Integration Suite" },
  { id: "PRJ-004", title: "Quality Assurance Sprint" },
  { id: "PRJ-005", title: "Cloud Infrastructure Migration" },
  { id: "PRJ-006", title: "Customer Portal v2.0" }
]

const AddManager: React.FC<AddManagerFormProps> = ({
  projectsList = mockProjects,
  onAdd
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
    projects: [] as string[]
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle file change for image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm({ ...form, image: file.name })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProjectSelect = (id: string) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.includes(id)
        ? prev.projects.filter((proj) => proj !== id)
        : [...prev.projects, id]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submit
    setTimeout(() => {
      setIsSubmitting(false)
      onAdd?.(form)
      setForm({ name: "", email: "", phone: "", image: "", projects: [] })
      setImagePreview(null)
      // Optionally show a toast or close modal here
    }, 1200)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center space-x-3">
          <User className="w-6 h-6 text-gray-700" />
          <span>Add New Manager</span>
        </h2>
        <p className="text-gray-600 mb-6">Fill in the details below to add a new project manager.</p>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>Name</span>
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Manager's full name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>Email</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="example@company.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>
          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>Phone</span>
            </label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 123-4567"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>
          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center space-x-2">
              <Image className="w-4 h-4 text-gray-400" />
              <span>Profile Image</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow"
                />
              )}
            </div>
          </div>
          {/* Projects */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center space-x-2">
              <FolderPlus className="w-4 h-4 text-gray-400" />
              <span>Projects</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {projectsList.map((project) => (
                <label
                  key={project.id}
                  className={`flex items-center px-3 py-2 rounded-lg border ${
                    form.projects.includes(project.id)
                      ? "border-blue-500 bg-blue-50 font-semibold text-blue-800"
                      : "border-gray-200 bg-gray-50"
                  } cursor-pointer transition-all duration-200`}
                >
                  <input
                    type="checkbox"
                    className="mr-2 accent-blue-500"
                    checked={form.projects.includes(project.id)}
                    onChange={() => handleProjectSelect(project.id)}
                  />
                  {project.title}
                </label>
              ))}
            </div>
          </div>
          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center bg-gray-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Add Manager
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddManager