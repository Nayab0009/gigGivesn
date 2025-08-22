"use client"
import { useState } from "react"

export default function SubmittalForm() {
  const [formData, setFormData] = useState({
    title: "",
    number: "",
    project: "",
    discipline: "",
    type: "",
    description: "",
    file: null,
    submittedBy: "",
    date: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: any) => {
    const { name, value, files } = e.target
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Submittal Data:", formData)
    alert("Submittal submitted successfully!")
    setIsSubmitting(false)
  }

  const totalFields = 9
  const completedFields = Object.values(formData).filter((value) => value !== "" && value !== null).length
  const completionPercentage = Math.round((completedFields / totalFields) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Submit New Submittal</h1>
          <p className="text-slate-300">Create and submit construction submittals with detailed specifications</p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-slate-700">Submittal Title</label>
                  </div>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter submittal title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-slate-700">Submittal Number</label>
                  </div>
                  <input
                    type="text"
                    name="number"
                    placeholder="Enter submittal number"
                    value={formData.number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-slate-700">Project Name / ID</label>
                  </div>
                  <input
                    type="text"
                    name="project"
                    placeholder="Enter project name or ID"
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-slate-700">Discipline</label>
                  </div>
                  <select
                    name="discipline"
                    value={formData.discipline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                    required
                  >
                    <option value="">Select Discipline</option>
                    <option value="Civil">Civil</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Plumbing">Plumbing</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-slate-700">Submittal Type</label>
                  </div>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Shop Drawing">Shop Drawing</option>
                    <option value="Product Data">Product Data</option>
                    <option value="Material Sample">Material Sample</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-slate-700">Description / Notes</label>
                  </div>
                  <textarea
                    name="description"
                    placeholder="Enter detailed description and notes"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-slate-700">Attachment</label>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      name="file"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-slate-700">Submitted By</label>
                  </div>
                  <input
                    type="text"
                    name="submittedBy"
                    placeholder="Enter your name"
                    value={formData.submittedBy}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-slate-700">Submission Date</label>
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Submittal...
                  </div>
                ) : (
                  "Submit Submittal"
                )}
              </button>
            </div>
          </form>

          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">Form Completion</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{completionPercentage}%</div>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>
                    Fields: {completedFields}/{totalFields}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Status: {completionPercentage === 100 ? "Ready" : "In Progress"}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
