"use client"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { getProjectTeam } from "@/lib/ProjectService"
import { AlertCircle, Calendar, LayoutGrid, Plus, RefreshCw, Search, Table, Users, Filter, ChevronDown } from "lucide-react"
import { colors } from "@/colors"

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  status?: string
}

type Project = {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  status?: string
  isActive?: boolean
  teamMembers?: TeamMember[]
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"summary" | "tasks" | "calendar" | "notes" | "members" | "settings">(
    "summary",
  )

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
    if (!id) return
    const resp = await getProjectTeam(String(id))
        if (!isMounted) return
        setProject(resp.data)
      } catch (e) {
        if (!isMounted) return
        setError("Failed to load project. Please try again.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [id])

  const statCards = [
    {
      label: "completed",
      value: 0,
      icon: <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".3" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    
    },
    {
      label: "updated",
      value: 0,
      icon: <RefreshCw className="w-5 h-5 text-sky-400" />, 
   
    },
    {
      label: "created",
      value: 0,
      icon: <Plus className="w-5 h-5 text-white/80" />, 
     
    },
    {
      label: "due soon",
      value: 0,
      icon: <Calendar className="w-5 h-5 text-orange-400" />, 
   
    },
  ]

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/70 text-sm">Project</div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
              {project ? project.name : isLoading ? "Loading…" : "—"}
            </h1>
          </div>
    </div>

        {/* Search */}
  <div className="backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4"
       style={{ background: '#0000004D' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-emerald-500"
              style={{ background: '#0000004D' }}
              placeholder="Search projects by name, ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
            }}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            Create
          </button>
        </div>

        {/* Tabs + view toggles */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            {/* Filter icon and text */}
            <button className="flex items-center gap-1 text-white/70 hover:text-white px-2 py-1 rounded-full transition-all focus:outline-none">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
            {/* Tabs */}
      <div className="flex border border-white/20 rounded-full p-1 gap-1 shadow-inner"
        style={{ background: '#0000004D' }}>
              {[
                { key: "summary", label: "Summary" },
                { key: "tasks", label: "Tasks" },
                { key: "calendar", label: "Calendar" },
                { key: "notes", label: "Notes" },
                { key: "members", label: "Members" },
                { key: "settings", label: "Settings" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${
                    activeTab === t.key
                      ? "bg-[#0000004D] text-white shadow border border-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/10 border border-transparent"
                  }`}
                  style={{ minWidth: 90 }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* View toggles */}
    <div className="flex border border-white/20 rounded-full p-1 gap-1 shadow-inner"
      style={{ background: '#0000004D' }}>
            <button className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 text-white/90 hover:text-white hover:bg-white/10 border border-transparent focus:outline-none">
              <Table className="w-4 h-4" /> Table View
            </button>
            <button className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 text-white/90 hover:text-white hover:bg-white/10 border border-transparent focus:outline-none">
              <LayoutGrid className="w-4 h-4" /> Kanban Board
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center border border-white/10 rounded-2xl" style={{ background: '#0000004D' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
            <p className="text-white/80">Loading project…</p>
          </div>
        ) : error ? (
          <div className="p-6 border border-red-200/40 rounded-2xl text-white" style={{ background: '#0000004D' }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-5 h-5 text-red-300" />
              <div className="font-semibold">Error loading project</div>
            </div>
            <div className="text-white/80 text-sm">{error}</div>
          </div>
        ) : project ? (
          <div className="space-y-6">
            {activeTab === "tasks" ? (
              <div className="space-y-6">
                {/* Active Tasks Table */}
                <div className="rounded-2xl border border-white/10 backdrop-blur-xl" style={{ background: '#0000004D' }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-white/70 text-sm border-b border-white/10">
                          <th className="px-6 py-3 text-left font-medium">
                            <div className="flex items-center gap-2 text-white">
                              <ChevronDown className="w-4 h-4 text-white/80" />
                              <span className="font-semibold">Active tasks</span>
                              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-white/10 text-white/80">1</span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-white text-left font-medium">Status</th>
                          <th className="px-6 py-3 text-left font-medium">Type</th>
                          <th className="px-6 py-3 text-left font-medium ">Due Date</th>
                          <th className="px-6 py-3 text-left font-medium">Priority</th>
                          <th className="px-6 py-3 text-left font-medium">Assignee</th>
                          <th className="px-6 py-3 text-left font-medium">Estimate Time</th>
                          <th className="px-6 py-3 text-left font-medium">Spent Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent">
                        {/* Example row, replace with dynamic data as needed */}
                        <tr className="text-white text-sm">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">AER001</td>
                          <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                            <span className="inline-flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-white"></span>
                              New Task
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                            <span className="inline-flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                              <span>Operational</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">Yesterday</td>
                          <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                            <span className="inline-flex items-center gap-2">
                              <ChevronDown className="w-4 h-4 text-red-400" />
                              <span>High</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                            <span className="inline-flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                                <img src="/images/user/1.png" alt="Assignee" className="w-6 h-6 rounded-full" />
                              </span>
                              <span className="text-white/80 text-sm font-medium">High</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">0.15h</td>
                          <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">0.15h</td>
                        </tr>
                        {/* Add more rows dynamically here */}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-3 text-white/70 text-sm">+ Create task</div>
                </div>
                {/* Completed Tasks Table */}
                <div className="rounded-2xl border border-white/10 backdrop-blur-xl" style={{ background: '#0000004D' }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-white/70 text-sm border-b border-white/10">
                          <th className="px-6 py-3 text-left font-medium">
                            <div className="flex items-center gap-2 text-white">
                              <ChevronDown className="w-4 h-4 text-white/80" />
                              <span className="font-semibold">Completed Task</span>
                              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-white/10 text-white/80">0</span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left font-medium">Status</th>
                          <th className="px-6 py-3 text-left font-medium ">Type</th>
                          <th className="px-6 py-3 text-left font-medium ">Due Date</th>
                          <th className="px-6 py-3 text-left font-medium ">Priority</th>
                          <th className="px-6 py-3 text-left font-medium ">Assignee</th>
                          <th className="px-6 py-3 text-left font-medium ">Estimate Time</th>
                          <th className="px-6 py-3 text-left font-medium ">Spent Time</th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div className="px-6 py-6 text-white/60 text-sm">No completed tasks yet</div>
                </div>
              </div>
            ) : (
              // ...existing code for summary, stats, etc...
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((c) => (
                    <div
                      key={c.label}
                      className="rounded-2xl border border-white/10 p-4 text-white/90 backdrop-blur-xl flex flex-col gap-2"
                      style={{ background: '#0000004D' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md`}>{c.icon}</span>
                        <span className="text-2xl font-semibold text-white mx-1">{c.value}</span>
                        <span className="text-sm capitalize font-medium text-white/80">{c.label}</span>
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {c.label === "due soon" ? "in the next 7 days" : "in the last 7 days"}
                      </div>
                    </div>
                  ))}
                </div>
                {/* ...existing code for status, activity, breakdown, etc... */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 p-6 text-white/90 backdrop-blur-xl min-h-[320px]" style={{ background: '#0000004D' }}>
                    <div className="text-lg font-semibold mb-2">Status overview</div>
                    <div className="text-white/70 text-sm mb-6">
                      The status overview for this project will display here after you <span style={{ color: '#0CA9F6' }}>create some work items</span>
                    </div>
                    <div className="text-center mt-18 text-4xl">0</div>
                    <div className="text-center text-white/60 text-sm">Total work items</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-6 text-white/90 backdrop-blur-xl min-h-[320px]" style={{ background: '#0000004D' }}>
                    <div className="text-lg font-semibold mb-2">Activity</div>
                    <div className="flex flex-col mt-12 items-center justify-center h-[150px]">
                      <div className="w-15 h-15 rounded-full flex items-center justify-center mb-3" style={{ background: '#DBEAFE4D' }}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-medium">No activity yet</div>
                      <div className="text-white/70 text-sm text-center mt-1">
                        Create a few work items and invite some teammates to your project to see your project activity.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 p-6 text-white/90 backdrop-blur-xl min-h-[320px]" style={{ background: '#0000004D' }}>
                    <div className="text-lg font-semibold mb-2">Priority breakdown</div>
                    <div className="text-white/70 text-sm mb-6">
                      Get a holistic view of how work is being prioritized.{' '}
                      <a href="#" className="text-[#0CA9F6] hover:underline" style={{ color: '#0CA9F6' }}>
                        How to manage priorities for projects
                      </a>
                    </div>
                    <div className="flex flex-col justify-end h-36">
                      <div className="flex items-center justify-center w-full">
                        <div className="w-4/5">
                          <div style={{ height: 2, background: 'linear-gradient(90deg, #0CA9F6 0%, #0CA9F6 100%)', borderRadius: 2 }} />
                        </div>
                      </div>
                      <div className="flex justify-between w-4/5 mx-auto mt-2 text-white/60 text-sm">
                        <span className="font-medium" style={{ color: '#6EE7B7' }}>Highest</span>
                        <span>High</span>
                        <span>Medium</span>
                        <span>Low</span>
                        <span>Lowest</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-6 text-white/90 backdrop-blur-xl min-h-[220px]" style={{ background: '#0000004D' }}>
                    <div className="text-lg font-semibold mb-2">Types of work</div>
                    <div className="text-white/70 text-sm mb-4">
                      Create some work items to view a breakdown of total work by work type.{' '}
                      <a href="#" className="text-[#0CA9F6] hover:underline" style={{ color: '#0CA9F6' }}>
                        What are work types?
                      </a>
                    </div>
                    <div className="flex justify-between items-center px-2 mb-2">
                      <span className=" text-[12px] text-white">Type</span>
                      <span className=" text-[12px] text-white">Distribution</span>
                    </div>
                    <div className="space-y-4">
                      {/* Task Row */}
                      <div className="flex items-center gap-4 bg-[#0000004D] text-white shadow border border-white/20 rounded-xl px-6 py-4">
                        <span className="inline-flex items-center justify-center w-5 h-5 border-2 border-[#0CA9F6] rounded text-[#0CA9F6] bg-black/40 mr-3">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="10" height="10" rx="2" fill="#0CA9F6" fillOpacity="0.1"/>
                            <path d="M5 8.5L7 10.5L11 6.5" stroke="#0CA9F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="text-white text-base font-medium mr-4">Task</span>
                        <div className="flex-1 flex items-center">
                          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                            <div className="h-2 bg-white/80 rounded-full w-11/12" />
                          </div>
                        </div>
                      </div>
                      {/* Sub-task Row */}
                      <div className="flex items-center gap-4 bg-[#0000004D] text-white shadow border border-white/20 rounded-xl px-6 py-4">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[#6EE7B7] mr-3">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="10" height="10" rx="2" fill="#6EE7B7" fillOpacity="0.1"/>
                            <path d="M5 8H11" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="text-white text-base font-medium mr-4">Sub-task</span>
                        <div className="flex-1 flex items-center">
                          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                            <div className="h-2 bg-white/60 rounded-full w-9/12" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
