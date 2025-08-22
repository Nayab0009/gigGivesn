"use client"

import type React from "react"

import { useState } from "react"

export default function RFICreateForm() {
  const [formData, setFormData] = useState({
    projectName: "",
    subject: "",
    discipline: "",
    question: "",
    reference: "",
    priority: "",
    dueDate: "",
    attachments: null as FileList | null,
  })

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("RFI Submitted:", formData)
      setSubmitted(true)
      setIsSubmitting(false)
      setFormData({
        projectName: "",
        subject: "",
        discipline: "",
        question: "",
        reference: "",
        priority: "",
        dueDate: "",
        attachments: null,
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New RFI</h1>
          <p className="text-gray-600 text-lg">Request for Information - Get clarification on project details</p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-green-800 font-semibold text-lg">✅ RFI submitted successfully!</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              RFI Information
            </h2>
            <p className="text-gray-300 mt-1">Fill in the details for your request</p>
          </div>

          {/* Form Body */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Project Name & Subject */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Subject / Title *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="e.g. Clarification on Window Detail"
                    required
                  />
                </div>
              </div>

              {/* Discipline & Priority */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Discipline *
                  </label>
                  <select
                    name="discipline"
                    value={formData.discipline}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                    required
                  >
                    <option value="">Select discipline</option>
                    <option value="Architectural">🏗️ Architectural</option>
                    <option value="Structural">🏢 Structural</option>
                    <option value="Mechanical">⚙️ Mechanical</option>
                    <option value="Electrical">⚡ Electrical</option>
                    <option value="Plumbing">🔧 Plumbing</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Priority *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                    required
                  >
                    <option value="">Select priority</option>
                    <option value="Normal">🟢 Normal</option>
                    <option value="High">🟡 High</option>
                    <option value="Critical">🔴 Critical</option>
                  </select>
                </div>
              </div>

              {/* Question */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Question / Request *
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white resize-none"
                  placeholder="Describe the clarification needed in detail..."
                  required
                />
              </div>

              {/* Reference & Due Date */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  Reference & Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reference (Drawing / Spec #)</label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                      placeholder="e.g. Drawing A101, Section 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Response Due Date *</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Attachments
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="attachments"
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    multiple
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-10 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="flex items-center gap-3">
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="text-lg">{isSubmitting ? "Submitting RFI..." : "Submit RFI"}</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{formData.projectName || "---"}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Project</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formData.discipline || "---"}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Discipline</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formData.priority || "---"}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Priority</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : "---"}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">Due Date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
