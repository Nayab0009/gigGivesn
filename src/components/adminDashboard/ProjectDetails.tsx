"use client"
import { useState, useEffect } from "react"
import { ArrowLeft, MessageSquare, User, Calendar, Clock, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"

interface Task {
  id: number
  title: string
  description: string
  status: string
  comment: string | null
  createdAt: string
  updatedAt: string
  taskFor: {
    id: number
    name: string
    email: string
    phone: string
    address: string
    role: string
  }
  taskOf: {
    id: number
    name: string
    description: string
    startDate: string
    endDate: string
  }
}

interface ProjectDetailsProps {
  projectId: string | number
  projectName?: string
}

const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return {
        color: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200',
        icon: <CheckCircle className="w-5 h-5" />,
        bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
        borderColor: 'border-emerald-200'
      };
    case 'inprogress':
      return {
        color: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-200',
        icon: <Clock className="w-5 h-5" />,
        bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
        borderColor: 'border-teal-200'
      };
    case 'cancelled':
      return {
        color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200',
        icon: <AlertCircle className="w-5 h-5" />,
        bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
        borderColor: 'border-red-200'
      };
    default:
      return {
        color: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200',
        icon: <Clock className="w-5 h-5" />,
        bgColor: 'bg-gradient-to-br from-slate-50 to-gray-50',
        borderColor: 'border-slate-200'
      };
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ProjectDetails({ projectId, projectName }: ProjectDetailsProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axiosInstance.get('/tasks')
      const allTasks = Array.isArray(response.data) ? response.data : []
      
      // Filter tasks for this specific project
      const projectTasks = allTasks.filter((task: Task) => task.taskOf.id === parseInt(projectId.toString()))
      setTasks(projectTasks)
      
      console.log('Project tasks:', projectTasks)
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      setError(
        error.response?.data?.message || 
        'Failed to load project tasks. Please try again.'
      )
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchTasks()
    setRefreshing(false)
  }

  useEffect(() => {
    if (projectId) {
      fetchTasks()
    }
  }, [projectId])

  const tasksWithComments = tasks.filter(task => task.comment)
  const tasksWithoutComments = tasks.filter(task => !task.comment)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 rounded-2xl font-semibold transition-all duration-300 hover:bg-white hover:shadow-lg transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent mb-4">
              {projectName || `Project #${projectId}`}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto">
              Project tasks and employee comments
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-100">Total Tasks</p>
                  <p className="font-bold text-lg">{tasks.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-100">With Comments</p>
                  <p className="font-bold text-lg">{tasksWithComments.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-100">Completed</p>
                  <p className="font-bold text-lg">
                    {tasks.filter(task => task.status.toLowerCase() === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing || isLoading}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-2xl text-sm font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/30"
            >
              <RefreshCw className={`w-5 h-5 transition-transform duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              Refresh Tasks
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-red-700 font-semibold text-lg">Error loading tasks</p>
            </div>
            <p className="text-red-600 mb-4 ml-13">{error}</p>
            <button
              onClick={fetchTasks}
              className="ml-13 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content Container */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-slate-600 text-xl font-medium">Loading project tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Tasks Found</h3>
              <p className="text-slate-500 text-lg">This project doesn't have any tasks assigned yet.</p>
            </div>
          ) : (
            <div className="p-8">
              {/* Tasks with Comments */}
              {tasksWithComments.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                    Tasks with Comments ({tasksWithComments.length})
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tasksWithComments.map((task) => {
                      const statusInfo = getStatusInfo(task.status)
                      
                      return (
                        <div
                          key={task.id}
                          className={`${statusInfo.bgColor} rounded-2xl border-2 ${statusInfo.borderColor} p-6 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2 group`}
                        >
                          {/* Task Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                                {task.title}
                              </h3>
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color} shadow-lg`}>
                                {statusInfo.icon}
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </div>
                            </div>
                          </div>

                          {/* Task Description */}
                          <div className="mb-4">
                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                              {task.description || 'No description provided'}
                            </p>
                          </div>

                          {/* Employee Info */}
                          <div className="mb-4 p-3 bg-white/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {task.taskFor.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">{task.taskFor.name}</p>
                                <p className="text-slate-600 text-xs">{task.taskFor.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Comment Section */}
                          <div className="mb-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-semibold text-emerald-700">Employee Comment</span>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">
                              {task.comment}
                            </p>
                          </div>

                          {/* Task Meta Info */}
                          <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-emerald-500" />
                              <span>Created: {formatDate(task.createdAt)}</span>
                            </div>
                            {task.updatedAt !== task.createdAt && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-emerald-500" />
                                <span>Updated: {formatDate(task.updatedAt)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-600 font-semibold">Task ID: #{task.id}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tasks without Comments */}
              {tasksWithoutComments.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-slate-600" />
                    Tasks without Comments ({tasksWithoutComments.length})
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tasksWithoutComments.map((task) => {
                      const statusInfo = getStatusInfo(task.status)
                      
                      return (
                        <div
                          key={task.id}
                          className="bg-white/80 rounded-2xl border-2 border-slate-200 p-6 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2 group"
                        >
                          {/* Task Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                                {task.title}
                              </h3>
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color} shadow-lg`}>
                                {statusInfo.icon}
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </div>
                            </div>
                          </div>

                          {/* Task Description */}
                          <div className="mb-4">
                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                              {task.description || 'No description provided'}
                            </p>
                          </div>

                          {/* Employee Info */}
                          <div className="mb-4 p-3 bg-slate-50/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {task.taskFor.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">{task.taskFor.name}</p>
                                <p className="text-slate-600 text-xs">{task.taskFor.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* No Comment Notice */}
                          <div className="mb-4 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-600">No comment provided yet</span>
                            </div>
                          </div>

                          {/* Task Meta Info */}
                          <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>Created: {formatDate(task.createdAt)}</span>
                            </div>
                            {task.updatedAt !== task.createdAt && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>Updated: {formatDate(task.updatedAt)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 font-semibold">Task ID: #{task.id}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 