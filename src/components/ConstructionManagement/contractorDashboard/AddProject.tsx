"use client";
import { useState } from "react";

export default function AddProject() {
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    clientName: "",
    startDate: "",
    endDate: "",
    duration: "",
    budget: "",
    location: "",
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Project Data:", formData);
      alert("✅ Construction project created successfully!");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v4H7v-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Project</h1>
          <p className="text-gray-600 text-lg">Set up your construction project with essential details</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Project Information
            </h2>
            <p className="text-gray-300 mt-1">Fill in the details to get started</p>
          </div>

          {/* Form Body */}
          <div className="p-8">
            <div className="space-y-8">
              {/* Project Name & Type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Project Type *
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                    required
                  >
                    <option value="">Select project type</option>
                    <option value="Residential">🏠 Residential</option>
                    <option value="Commercial">🏢 Commercial</option>
                    <option value="Infrastructure">🌉 Infrastructure</option>
                    <option value="Industrial">🏭 Industrial</option>
                    <option value="Renovation">🔨 Renovation</option>
                  </select>
                </div>
              </div>

              {/* Client & Budget */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Enter client name"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Budget *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Project Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Months)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      placeholder="e.g., 12"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Project Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                  placeholder="Enter complete address"
                  required
                />
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Project Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white resize-none"
                  placeholder="Describe the project scope, objectives, and key requirements..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="group relative px-12 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center gap-3">
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-lg">
                    {isSubmitting ? 'Creating Project...' : 'Create Project'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{formData.projectName || "---"}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Project Name</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formData.budget ? `$${Number(formData.budget).toLocaleString()}` : "$0"}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">Budget</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formData.duration || "0"}m</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Duration</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formData.projectType || "---"}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Type</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}