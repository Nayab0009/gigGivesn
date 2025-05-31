"use client"
import { useState, useEffect } from "react"
import { User, Mail, Phone, Building2, Calendar, Star, Plus, X, Save, ArrowLeft, Users, Briefcase, MapPin, Award, Upload, Eye, EyeOff } from 'lucide-react'

// Types
interface Project {
  id: string
  title: string
  priority: "High" | "Medium" | "Low"
  status: "Active" | "Completed" | "On Hold"
  progress: number
}

interface ManagerFormData {
  id: string
  name: string
  email: string
  phone: string
  department: string
  experience: string
  status: "Active" | "Inactive" | "On Leave"
  joinDate: string
  avatar: string
  projectsHandled: Project[]
  position: string
  location: string
  salary: string
  emergencyContact: string
  skills: string[]
}

const DEPARTMENTS = [
  "Engineering", "Product", "Operations", "Infrastructure", 
  "Design", "Marketing", "Sales", "HR", "Finance"
]

const PRIORITY_OPTIONS = ["High", "Medium", "Low"]
const STATUS_OPTIONS = ["Active", "Completed", "On Hold"]
const MANAGER_STATUS_OPTIONS = ["Active", "Inactive", "On Leave"]

const SAMPLE_PROJECTS = [
  "E-commerce Platform Redesign", "Mobile Banking App", "API Integration Suite",
  "Quality Assurance Sprint", "Cloud Infrastructure Migration", "Customer Portal v2.0",
  "Data Analytics Dashboard", "Security Audit Implementation", "Brand Identity Refresh",
  "Digital Marketing Campaign", "Social Media Strategy", "Content Management System"
]

const SKILLS_OPTIONS = [
  "Project Management", "Agile/Scrum", "Leadership", "Team Building", 
  "Strategic Planning", "Risk Management", "Budget Management", "Stakeholder Management",
  "Communication", "Problem Solving", "Decision Making", "Time Management"
]

export default function EnhancedManagerForm() {
  const [formData, setFormData] = useState<ManagerFormData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    experience: '',
    status: 'Active',
    joinDate: '',
    avatar: '',
    projectsHandled: [],
    position: '',
    location: '',
    salary: '',
    emergencyContact: '',
    skills: []
  })

  const [showProjectForm, setShowProjectForm] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project>({
    id: '',
    title: '',
    priority: 'Medium',
    status: 'Active',
    progress: 0
  })
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null)
  const [showSalary, setShowSalary] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate Manager ID
  useEffect(() => {
    if (!formData.id) {
      const timestamp = Date.now().toString().slice(-6)
      setFormData(prev => ({ ...prev, id: `MGR-${timestamp}` }))
    }
  }, [])

  // Generate avatar when name changes
  useEffect(() => {
    if (formData.name && !formData.avatar) {
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
      setFormData(prev => ({ ...prev, avatar }))
    }
  }, [formData.name])

  const handleInputChange = (field: keyof ManagerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleAddProject = () => {
    if (!currentProject.title.trim()) return
    const projectWithId = {
      ...currentProject,
      id: `PRJ-${Date.now().toString().slice(-6)}`
    }
    if (editingProjectIndex !== null) {
      const updatedProjects = [...formData.projectsHandled]
      updatedProjects[editingProjectIndex] = projectWithId
      setFormData(prev => ({ ...prev, projectsHandled: updatedProjects }))
      setEditingProjectIndex(null)
    } else {
      setFormData(prev => ({
        ...prev,
        projectsHandled: [...prev.projectsHandled, projectWithId]
      }))
    }
    setCurrentProject({ id: '', title: '', priority: 'Medium', status: 'Active', progress: 0 })
    setShowProjectForm(false)
  }

  const handleEditProject = (index: number) => {
    setCurrentProject(formData.projectsHandled[index])
    setEditingProjectIndex(index)
    setShowProjectForm(true)
  }

  const handleDeleteProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projectsHandled: prev.projectsHandled.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Form submitted:', formData)
    alert('Manager data saved successfully!')
    setIsSubmitting(false)
  }

  const PRIORITY_CONFIG = {
    High: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    Medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    Low: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  }

  const STATUS_CONFIG = {
    Active: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    Completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    "On Hold": { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ... (rest of the code is unchanged above) ... */}
        {/* Project Form Modal */}
        {showProjectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingProjectIndex !== null ? 'Edit Project' : 'Add New Project'}
                </h3>
                <button
                  onClick={() => {
                    setShowProjectForm(false)
                    setCurrentProject({ id: '', title: '', priority: 'Medium', status: 'Active', progress: 0 })
                    setEditingProjectIndex(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title *</label>
                  <input
                    type="text"
                    value={currentProject.title}
                    onChange={(e) => setCurrentProject(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter project title or select from suggestions"
                    list="project-suggestions"
                  />
                  <datalist id="project-suggestions">
                    {SAMPLE_PROJECTS.map(project => (
                      <option key={project} value={project} />
                    ))}
                  </datalist>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select
                      value={currentProject.priority}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      {PRIORITY_OPTIONS.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={currentProject.status}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentProject.progress}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectForm(false)
                      setCurrentProject({ id: '', title: '', priority: 'Medium', status: 'Active', progress: 0 })
                      setEditingProjectIndex(null)
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2 shadow"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingProjectIndex !== null ? "Update" : "Add"} Project</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* END MODAL */}
      </div>
    </div>
  )
}