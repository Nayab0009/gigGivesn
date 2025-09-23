"use client"
import { useEffect, useState } from "react"
import axiosInstance from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { getTasksByEmployeeId } from "@/lib/TaskService"

// Import components
import TimeTable from "./EmployeeTimeTable"
import NotesCard from "./NotesCard"
import Remainder from "./Remainder"
import CommunicationLogs from "./CommunicationLogs"
import LoadingSpinner from "./LoadingSpinner"
import HeaderSection from "./HeaderSection"
import TodayTasksSection from "./TodayTasksSection"
import ProjectFilters from "./ProjectFilters"
import MyTaskCard from "./MyTaskCard"

export default function Dashboard() {
  const { user } = useAuth()
  const [todayTasks, setTodayTasks] = useState<any[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTimeFilter, setActiveTimeFilter] = useState("Today")
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  })
  const [myTasksData, setMyTasksData] = useState({
    totalProjects: 100,
    inProgress: 50,
    completed: 25,
    pending: 15,
  })

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setTasksLoading(true)
      try {
        const data = user?.id ? await getTasksByEmployeeId(user.id.toString()) : []
        const priorityBuckets: Record<string, any[]> = { high: [], medium: [], low: [], other: [] }

        if (Array.isArray(data)) {
          data.forEach(task => {
            const p = String(task.priority || "").toLowerCase()
            if (p === "high") priorityBuckets.high.push(task)
            else if (p === "medium") priorityBuckets.medium.push(task)
            else if (p === "low") priorityBuckets.low.push(task)
            else priorityBuckets.other.push(task)
          })
        }

        const result: any[] = []
        if (priorityBuckets.high.length) result.push(priorityBuckets.high[0])
        if (priorityBuckets.medium.length) result.push(priorityBuckets.medium[0])
        if (priorityBuckets.low.length) result.push(priorityBuckets.low[0])

        const usedIds = new Set(result.map(t => t.id))
        const allRemaining = [
          ...priorityBuckets.high.slice(1),
          ...priorityBuckets.medium.slice(1),
          ...priorityBuckets.low.slice(1),
          ...priorityBuckets.other,
        ]
        for (const t of allRemaining) {
          if (result.length >= 2) break
          if (!usedIds.has(t.id)) result.push(t)
        }
        setTodayTasks(result)
      } catch {
        setTodayTasks([])
      } finally {
        setTasksLoading(false)
      }
    }
    fetchTasks()
  }, [user?.id])

  // Fetch projects
  useEffect(() => {
    const fetchManagerProjects = async () => {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await axiosInstance.get("/projects/manager/all")
        const projectsData = Array.isArray(response.data) ? response.data : []

        const totalProjects = projectsData.length
        const activeProjects = projectsData.filter(
          (p: any) =>
            p.status?.toLowerCase() === "active" || p.status?.toLowerCase() === "inprogress"
        ).length
        const completedProjects = projectsData.filter(
          (p: any) => p.status?.toLowerCase() === "completed"
        ).length

        setAnalytics({
          totalProjects,
          activeProjects,
          completedProjects,
        })
      } catch (error) {
        console.error("Error fetching manager projects:", error)
        setError("Failed to load projects. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchManagerProjects()
  }, [user?.id])

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen pb-12 text-white rounded-2xl">
      {/* Header */}
      <HeaderSection userName={user?.name} error={error} />

      {/* Main Content */}
      <div className="mx-auto px-6 mb-10">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Left Side */}
          <div className="md:col-span-3 flex gap-6">
            <div className="h-[230px] w-[1000px]">
              <TodayTasksSection tasks={todayTasks} isLoading={tasksLoading} />
            </div>
            <div className="h-[230px] w-[332px]">
              <NotesCard />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col gap-6 w-full max-w-[340px] mx-auto">
            <div className="flex-1">
              <MyTaskCard
                totalProjects={myTasksData.totalProjects}
                inProgress={myTasksData.inProgress}
                completed={myTasksData.completed}
                pending={myTasksData.pending}
              />
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left: Timetable + Filters */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div>
              <ProjectFilters onFilterChange={setActiveTimeFilter} />
            </div>
            {/* Timetable grows to match Reminder */}
            <div className="rounded-2xl border border-blue-200/30 bg-black/30 flex-1 overflow-auto scrollbar-none">
              <TimeTable employeeId={user?.id} />
            </div>
          </div>

          {/* Right Column: CommunicationLogs + Reminder (define total height) */}
          <div className="flex flex-col gap-6 w-full max-w-[340px] mx-auto h-full">
            <div className="flex-1">
              <CommunicationLogs userId={user?.id?.toString()} userRole={user?.role} />
            </div>
            <div className="flex-1">
              <Remainder />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
