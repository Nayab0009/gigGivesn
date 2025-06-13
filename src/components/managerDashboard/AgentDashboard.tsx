"use client";
import React, { useEffect, useState } from 'react';
import { Users, List, BarChart2, UserPlus, Calendar, Target, TrendingUp, Award, Clock, CheckCircle } from "lucide-react";

// Static demo data
const staticProjects = [
  {
    id: 1,
    title: "Mobile App Redesign",
    status: "Active",
    description: "Complete UI/UX overhaul of the mobile application with modern design principles",
    startDate: "2024-03-15",
    endDate: "2024-07-30",
    progress: 65,
    priority: "High"
  },
  {
    id: 2,
    title: "E-commerce Integration",
    status: "Active",
    description: "Integrate payment gateway and shopping cart functionality",
    startDate: "2024-04-01",
    endDate: "2024-06-15",
    progress: 80,
    priority: "Medium"
  },
  {
    id: 3,
    title: "Customer Dashboard",
    status: "Completed",
    description: "Build comprehensive customer analytics and reporting dashboard",
    startDate: "2024-01-10",
    endDate: "2024-03-20",
    progress: 100,
    priority: "High"
  },
  {
    id: 4,
    title: "API Documentation",
    status: "Active",
    description: "Create comprehensive API documentation for external developers",
    startDate: "2024-05-01",
    endDate: "2024-06-30",
    progress: 45,
    priority: "Low"
  },
  {
    id: 5,
    title: "Security Audit",
    status: "Pending",
    description: "Complete security assessment and implementation of fixes",
    startDate: "2024-06-01",
    endDate: "2024-08-15",
    progress: 20,
    priority: "High"
  },
  {
    id: 6,
    title: "Marketing Website",
    status: "Completed",
    description: "Develop new marketing website with SEO optimization",
    startDate: "2024-02-01",
    endDate: "2024-04-10",
    progress: 100,
    priority: "Medium"
  }
];

const staticTeamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1-555-0123",
    role: "Senior Developer",
    avatar: "SJ",
    status: "online"
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@company.com",
    phone: "+1-555-0124",
    role: "UI/UX Designer",
    avatar: "MC",
    status: "online"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    phone: "+1-555-0125",
    role: "Project Manager",
    avatar: "ER",
    status: "away"
  },
  {
    id: 4,
    name: "David Thompson",
    email: "david.thompson@company.com",
    phone: "+1-555-0126",
    role: "Backend Developer",
    avatar: "DT",
    status: "online"
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    phone: "+1-555-0127",
    role: "QA Engineer",
    avatar: "LW",
    status: "offline"
  },
  {
    id: 6,
    name: "James Wilson",
    email: "james.wilson@company.com",
    phone: "+1-555-0128",
    role: "DevOps Engineer",
    avatar: "JW",
    status: "online"
  }
];

interface Project {
  id: number | string;
  title: string;
  status: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  priority?: string;
}

interface TeamMember {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  avatar?: string;
  status?: string;
}

interface AnalyticsData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  teamMembers: number;
}

export default function ManagerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamMembers: 0,
  });

  useEffect(() => {
    // Simulate loading and set static data
    setTimeout(() => {
      setProjects(staticProjects);
      setTeamMembers(staticTeamMembers);
      setAnalytics({
        totalProjects: staticProjects.length,
        activeProjects: staticProjects.filter(p => p.status === "Active").length,
        completedProjects: staticProjects.filter(p => p.status === "Completed").length,
        teamMembers: staticTeamMembers.length
      });
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white";
      case "Completed":
        return "bg-gradient-to-r from-purple-400 to-indigo-500 text-white";
      case "Pending":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "away":
        return "bg-yellow-400";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="px-4 py-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="flex items-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <span className="text-3xl font-bold">Manager Dashboard</span>
        </div>
        <div className="ml-4 px-3 py-1 bg-gradient-to-r from-pink-400 to-red-400 text-white text-sm font-medium rounded-full">
          Live
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-3 rounded-xl">
              <BarChart2 className="w-8 h-8 text-white" />
            </div>
            <TrendingUp className="w-6 h-6 text-white/70" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{analytics.totalProjects}</div>
            <div className="text-white/80 text-sm mt-1">Total Projects</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-3 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <Clock className="w-6 h-6 text-white/70" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{analytics.activeProjects}</div>
            <div className="text-white/80 text-sm mt-1">Active Projects</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-3 rounded-xl">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <Award className="w-6 h-6 text-white/70" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{analytics.completedProjects}</div>
            <div className="text-white/80 text-sm mt-1">Completed Projects</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-400 via-rose-500 to-red-600 p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-3 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <UserPlus className="w-6 h-6 text-white/70" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{analytics.teamMembers}</div>
            <div className="text-white/80 text-sm mt-1">Team Members</div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Projects</h2>
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium">
            <UserPlus className="w-5 h-5 mr-2" />
            Add Project
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">{project.title}</h3>
                  <div className="flex flex-col gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    {project.priority && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-md border ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                
                {project.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-800">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-xs text-gray-500 gap-4">
                  {project.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  )}
                  {project.endDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Team Members</h2>
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium">
            <Users className="w-5 h-5 mr-2" />
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.slice(0, 4).map(member => (
            <div key={member.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="relative">
                  <div className="flex-shrink-0 rounded-xl h-16 w-16 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl font-bold text-white mr-4 shadow-lg">
                    {member.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusDot(member.status)} rounded-full border-2 border-white`}></div>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-lg">{member.name}</div>
                  <div className="text-gray-600 font-medium">{member.role}</div>
                  <div className="text-gray-400 text-sm">{member.email}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {teamMembers.length > 4 && (
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200">
              View all {teamMembers.length} team members →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}