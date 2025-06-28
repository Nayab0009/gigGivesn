"use client"
import type React from "react"
import { useState } from "react"
import { Loader2, CalendarDays, FileText, Plus, Sparkles } from "lucide-react"
import { createProject } from "@/lib/ProjectService"

// You can install and use react-datepicker for a better UX:
// npm install react-datepicker
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const AddProject: React.FC = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (date: Date | null, field: "startDate" | "endDate") => {
    setForm((prev) => ({
      ...prev,
      [field]: date,
    }))
  }

  // --- API POST handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
  
    const payload = {
      name: form.title,
      description: form.description,
      startDate: form.startDate ? form.startDate.toISOString() : undefined,
      endDate: form.endDate ? form.endDate.toISOString() : undefined,
    };
  
    try {
      const response = await createProject(payload);
      setForm({
        title: "",
        description: "",
        startDate: null,
        endDate: null,
      });
      setSuccess("Project added successfully!");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add project");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50 flex items-center justify-center p-4 sm:p-6 ml-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-3">
            Create New Project
          </h1>
          <p className="text-gray-600 text-lg font-medium">Transform your ideas into reality</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Project Title */}
            <div className="group">
              <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg">Project Title</span>
              </label>
              <div className="relative">
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter your amazing project title..."
                  className="w-full border-2 border-emerald-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-emerald-300"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-sm">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg">Project Description</span>
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your project vision, goals, and key features..."
                  rows={5}
                  className="w-full border-2 border-teal-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md resize-none group-hover:border-teal-300"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Start Date */}
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm">
                    <CalendarDays className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Start Date</span>
                  <span className="text-sm text-gray-500 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-green-300">
                    <DatePicker
                      selected={form.startDate}
                      onChange={(date) => handleDateChange(date, "startDate")}
                      className="w-full px-6 py-4 text-lg bg-transparent border-none rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:outline-none"
                      placeholderText="Select project start date"
                      dateFormat="MMM dd, yyyy"
                      isClearable
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                        <CalendarDays className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* End Date */}
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-sm">
                    <CalendarDays className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">End Date</span>
                  <span className="text-sm text-gray-500 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-cyan-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-cyan-300">
                    <DatePicker
                      selected={form.endDate}
                      onChange={(date) => handleDateChange(date, "endDate")}
                      className="w-full px-6 py-4 text-lg bg-transparent border-none rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:outline-none"
                      placeholderText="Select project end date"
                      dateFormat="MMM dd, yyyy"
                      isClearable
                      minDate={form.startDate || undefined}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="flex items-center justify-center w-8 h-8 bg-cyan-100 rounded-lg">
                        <CalendarDays className="w-4 h-4 text-cyan-600" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
                <div className="text-emerald-700 font-semibold text-lg flex items-center justify-center space-x-2">
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
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white font-bold py-4 px-12 rounded-full hover:from-emerald-700 hover:via-teal-700 hover:to-teal-800 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-lg transform hover:scale-105 active:scale-95 min-w-[200px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-6 h-6 mr-3" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
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
