"use client";
import { useState } from "react";

export default function ContcatorProjectsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("startDate");
  const [viewMode, setViewMode] = useState("table"); // table or card

  // Sample project data
  const [projects] = useState([
    {
      id: 1,
      projectName: "Green Valley Residential Complex",
      projectType: "Residential",
      clientName: "Valley Properties Ltd",
      startDate: "2024-03-15",
      endDate: "2024-12-20",
      duration: "9",
      budget: 2500000,
      location: "Downtown District, Metro City",
      status: "In Progress",
      progress: 35,
      description: "Modern residential complex with 150 units featuring sustainable design and smart home technology."
    },
    {
      id: 2,
      projectName: "Metro Shopping Mall Expansion",
      projectType: "Commercial",
      clientName: "Retail Dynamics Corp",
      startDate: "2024-01-10",
      endDate: "2024-08-30",
      duration: "8",
      budget: 4200000,
      location: "Business Center, Metro City",
      status: "In Progress",
      progress: 65,
      description: "Expansion of existing shopping mall adding 50,000 sq ft retail space with modern amenities."
    },
    {
      id: 3,
      projectName: "Highway Bridge Construction",
      projectType: "Infrastructure",
      clientName: "Department of Transportation",
      startDate: "2023-11-01",
      endDate: "2024-10-15",
      duration: "12",
      budget: 8500000,
      location: "Highway 101, State Route",
      status: "Completed",
      progress: 100,
      description: "Construction of a 500-meter steel bridge with advanced safety features and environmental compliance."
    },
    {
      id: 4,
      projectName: "Tech Campus Office Building",
      projectType: "Commercial",
      clientName: "InnovateTech Solutions",
      startDate: "2024-05-01",
      endDate: "2025-03-15",
      duration: "10",
      budget: 3800000,
      location: "Tech Park Avenue, Silicon Valley",
      status: "Planning",
      progress: 15,
      description: "State-of-the-art office building with flexible workspaces and sustainability features."
    },
    {
      id: 5,
      projectName: "Luxury Villa Estate",
      projectType: "Residential",
      clientName: "Elite Homes Inc",
      startDate: "2024-04-20",
      endDate: "2024-11-30",
      duration: "7",
      budget: 1800000,
      location: "Hillside Gardens, Suburban Area",
      status: "In Progress",
      progress: 45,
      description: "Premium luxury villa with custom architecture, landscaping, and high-end finishes."
    },
    {
      id: 6,
      projectName: "Manufacturing Plant Renovation",
      projectType: "Industrial",
      clientName: "AutoParts Manufacturing",
      startDate: "2024-02-15",
      endDate: "2024-09-10",
      duration: "7",
      budget: 2900000,
      location: "Industrial Zone, Manufacturing District",
      status: "In Progress",
      progress: 80,
      description: "Complete renovation of existing manufacturing facility with modern equipment and safety upgrades."
    }
  ]);

  // Filter and search logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "" || project.projectType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Sort logic
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "budget":
        return b.budget - a.budget;
      case "progress":
        return b.progress - a.progress;
      case "startDate":
        return new Date(b.startDate) - new Date(a.startDate);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "On Hold":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Projects Dashboard
              </h1>
              <p className="text-gray-300 text-lg mt-2">Manage and monitor all your construction projects</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-sm text-gray-300">Total Projects</div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">${(projects.reduce((sum, p) => sum + p.budget, 0) / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-300">Total Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects, clients, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
              >
                <option value="">All Types</option>
                <option value="Residential">🏠 Residential</option>
                <option value="Commercial">🏢 Commercial</option>
                <option value="Infrastructure">🌉 Infrastructure</option>
                <option value="Industrial">🏭 Industrial</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white"
              >
                <option value="startDate">📅 Sort by Date</option>
                <option value="budget">💰 Sort by Budget</option>
                <option value="progress">📈 Sort by Progress</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  viewMode === "table" ? "bg-white shadow-md text-gray-900" : "text-gray-600"
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
                Table
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  viewMode === "card" ? "bg-white shadow-md text-gray-900" : "text-gray-600"
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {viewMode === "table" ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Project</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Timeline</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Budget</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Progress</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{project.projectName}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                            {project.projectType}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{project.location}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{project.clientName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{new Date(project.startDate).toLocaleDateString()}</div>
                          <div className="text-gray-500">to {new Date(project.endDate).toLocaleDateString()}</div>
                          <div className="text-gray-600 font-medium mt-1">{project.duration} months</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-green-600">
                          ${project.budget.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{project.projectName}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                        {project.projectType}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Client:</span>
                      <span className="ml-2 font-medium text-gray-900">{project.clientName}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Budget:</span>
                      <span className="ml-2 font-bold text-green-600">${project.budget.toLocaleString()}</span>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium text-gray-900">{project.duration} months</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress:</span>
                        <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Location:</span>
                      <p className="text-sm text-gray-900 mt-1">{project.location}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedProjects.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}