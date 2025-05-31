"use client"
import React, { useState } from "react"
import { User, Mail, Phone, Image, FolderPlus, Loader2, Building2, Shield, Calendar } from "lucide-react"

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
  { id: "PRJ-006", title: "Customer Portal v2.0" },
  { id: "PRJ-007", title: "Data Analytics Dashboard" },
  { id: "PRJ-008", title: "Security Compliance Audit" }
]

const AddManager: React.FC<AddManagerFormProps> = ({
  projectsList = mockProjects,
  onAdd
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    startDate: "",
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
      setForm({ name: "", email: "", phone: "", department: "", startDate: "", image: "", projects: [] })
      setImagePreview(null)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Manager</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete the form below to onboard a new project manager to your team
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Manager Information</h2>
            </div>
            <p className="text-blue-100 mt-1">All fields marked with * are required</p>
          </div>

          <div className="p-8 lg:p-12">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
              {/* Left Column - Profile Preview */}
              <div className="xl:col-span-4">
                <div className="sticky top-8">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Profile Preview
                    </h3>
                    
                    <div className="text-center">
                      <div className="relative inline-block group">
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-1 shadow-lg">
                          <img
                            src={
                              imagePreview ||
                              "https://api.dicebear.com/7.x/avataaars/svg?seed=manager"
                            }
                            alt="Preview"
                            className="w-full h-full rounded-xl object-cover border-2 border-white group-hover:scale-105 transition-all duration-300"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 shadow-lg">
                          <Image className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-3">
                        <h4 className="text-xl font-bold text-gray-900">
                          {form.name || "Manager Name"}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600 flex items-center justify-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {form.email || "email@company.com"}
                          </p>
                          <p className="text-gray-600 flex items-center justify-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {form.phone || "+1 (555) 123-4567"}
                          </p>
                          <p className="text-gray-600 flex items-center justify-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            {form.department || "Department"}
                          </p>
                        </div>
                        
                        {form.projects.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">Assigned Projects</p>
                            <div className="flex flex-wrap gap-1">
                              {form.projects.slice(0, 3).map((projectId) => {
                                const project = mockProjects.find(p => p.id === projectId)
                                return (
                                  <span key={projectId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {project?.title.split(' ')[0]}
                                  </span>
                                )
                              })}
                              {form.projects.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  +{form.projects.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="xl:col-span-8">
                <div className="space-y-8">
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center pb-2 border-b border-gray-200">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter full name"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="example@company.com"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          placeholder="+1 (555) 123-4567"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="department"
                          value={form.department}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        >
                          <option value="">Select Department</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Product">Product</option>
                          <option value="Design">Design</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operations">Operations</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="startDate"
                          type="date"
                          value={form.startDate}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Image Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center pb-2 border-b border-gray-200">
                      <Image className="w-5 h-5 mr-2 text-blue-600" />
                      Profile Image
                    </h3>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer block"
                      >
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <Image className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Click to upload profile image
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, or JPEG. Max file size 2MB.
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Project Assignment Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center pb-2 border-b border-gray-200">
                      <FolderPlus className="w-5 h-5 mr-2 text-blue-600" />
                      Project Assignment
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {projectsList.map((project) => (
                        <label
                          key={project.id}
                          className={`group flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            form.projects.includes(project.id)
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={form.projects.includes(project.id)}
                            onChange={() => handleProjectSelect(project.id)}
                          />
                          <div className="ml-3 flex-1">
                            <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                              {project.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Project ID: {project.id}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    
                    {form.projects.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm font-medium text-blue-800">
                          Selected {form.projects.length} project{form.projects.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin w-6 h-6 mr-3" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <User className="w-6 h-6 mr-3" />
                          Add Manager to Team
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddManager