"use client"
import React, { useState } from "react"
import { User, Mail, Phone, Image, FolderPlus, Loader2 } from "lucide-react"

type ProjectOption = {
  id: string
  title: string
}

interface AddManagerFormProps {
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
    setTimeout(() => {
      setIsSubmitting(false)
      onAdd?.(form)
      setForm({ name: "", email: "", phone: "", image: "", projects: [] })
      setImagePreview(null)
    }, 1200)
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Manager</h1>
        </div>

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

          {/* Phone & Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                <Image className="w-5 h-5 text-black" />
                <span>Profile Image</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 bg-white border border-gray-300 rounded-xl transition-all duration-200"
              />
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 shadow-lg"
                />
              </div>
            </div>
          )}

          {/* Projects */}
          <div>
            <label className="block text-gray-700 font-medium mb-4 flex items-center space-x-2">
              <FolderPlus className="w-5 h-5 text-black" />
              <span>Projects</span>
            </label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projectsList.map((project) => (
                <label
                  key={project.id}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    form.projects.includes(project.id)
                      ? "border-black bg-gray-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    checked={form.projects.includes(project.id)}
                    onChange={() => handleProjectSelect(project.id)}
                  />
                  <span className="font-medium text-gray-900">{project.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
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
      </div>
    </div>
  )
}

export default AddManager