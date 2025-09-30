"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { getEmployeeTasksToday,getTaskAnalytics } from "@/lib/TaskService"
import { ShowEmployee } from "@/lib/TeamService"
import { sendMessage as fetchChatHistoryAPI } from "@/lib/chatService"

// Import components
import TimeTable from "./EmployeeTimeTable"
import NotesCard from "./NotesCard"
import Remainder from "./Remainder"
import CommunicationLogsCard from "./CommunicationLogsCard"
import LoadingSpinner from "./LoadingSpinner"
import HeaderSection from "./HeaderSection"
import TodayTasksSection from "./TodayTasksSection"
import ProjectFilters from "./ProjectFilters"
import MyTaskCard from "./MyTaskCard"
import TodayTask from "../managerDashboard/TodayTask"

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [todayTasks, setTodayTasks] = useState<any[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  //  const [tasksLoading, setTasksLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState("Today")
  const [commLogs, setCommLogs] = useState<any[]>([])
  const [commLoading, setCommLoading] = useState(false)
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  })
  const [myTasksData, setMyTasksData] = useState({
    totalProjects: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
  })

  // Fetch tasks and analytics for MyTaskCard
  useEffect(() => {
    const fetchTasks = async () => {
      setTasksLoading(true)
      try {
        const data = user?.id ? await getEmployeeTasksToday() : []
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

        // Fetch analytics for MyTaskCard
        const analyticsData = await getTaskAnalytics();
        setMyTasksData({
          totalProjects: analyticsData.total || 0,
          completed: analyticsData.totalCompleted || 0,
          pending: analyticsData.totalPending || 0,
          inProgress: (analyticsData.total || 0) - (analyticsData.totalCompleted || 0) - (analyticsData.totalPending || 0),
        });
      } catch {
        setTodayTasks([])
        setMyTasksData({ totalProjects: 0, inProgress: 0, completed: 0, pending: 0 })
      } finally {
        setTasksLoading(false)
      }
    }
    fetchTasks()
  }, [user?.id])

  // Fetch Communication Logs
  useEffect(() => {
    const fetchCommLogs = async () => {
      if (!user?.id || !user?.role) return;
      console.log('Fetching communication logs for user:', user?.id, 'with role:', user?.role);
      setCommLoading(true);
      try {
        const contactRole = user.role === "employee" ? "manager" : "employee";
        console.log('Contact role to fetch:', contactRole);
        const response = await ShowEmployee(contactRole);
        console.log('ShowEmployee raw response:', response);
        
        // First try the structure from manager dashboard
        let contacts = [];
        if (Array.isArray(response?.data?.[0])) {
          contacts = response.data[0].slice(0, 2);
          console.log('Found nested array structure, extracted contacts:', contacts);
        } 
        // If that doesn't work, try the direct array
        else if (Array.isArray(response?.data)) {
          contacts = response.data.slice(0, 2);
          console.log('Found direct array structure, extracted contacts:', contacts);
        } 
        // If both fail, log the actual structure
        else {
          console.log('Could not extract contacts. Response data structure:', 
                     typeof response?.data, 
                     JSON.stringify(response?.data).substring(0, 200) + '...');
          contacts = [];
        }
        
        console.log('Final contacts to process:', contacts);
        const logs = await Promise.all(
          contacts.map(async (contact: any) => {
            let lastMsg = null;
            try {
              const data = await fetchChatHistoryAPI(user.id.toString(), contact.id.toString());
              const arr = Array.isArray(data) ? data : data.messages || [];
              if (arr.length > 0) {
                const msg = arr[arr.length - 1];
                lastMsg = typeof msg.messageBody === "string" && msg.messageBody.startsWith("http")
                  ? "File"
                  : msg.messageBody || "No Chat Yet";
              }
            } catch {}
            return {
              id: contact.id,
              name: contact.name,
              avatar: contact.avatar || undefined,
              lastMessage: lastMsg || "No Chat Yet",
              isActive: contact.isOnline ?? false,
            };
          })
        );
        console.log('Communication logs to be set:', logs);
        setCommLogs(logs);
      } catch (e) {
        console.error('Error fetching communication logs:', e);
        setCommLogs([]);
      } finally {
        setCommLoading(false);
      }
    };
    fetchCommLogs();
  }, [user?.id, user?.role]);

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

   const handleViewAllClick = () => setIsPopupOpen(true);

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
              <TodayTasksSection
                tasks={todayTasks}
                tasksLoading={tasksLoading}
                isLoading={tasksLoading}
                onViewAll={handleViewAllClick}
                highCount={todayTasks.filter(t => t.priority?.toLowerCase() === "high").length}
                mediumCount={todayTasks.filter(t => t.priority?.toLowerCase() === "medium").length}
                lowCount={todayTasks.filter(t => t.priority?.toLowerCase() === "low").length}
                totalCount={todayTasks.length}
              />
            </div>

            <div className="h-[230px] w-[332px]">
              <NotesCard />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col gap-6 w-full max-w-[340px] mx-auto">
            <div className="flex-1">
              <MyTaskCard
                total={myTasksData.totalProjects}
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
            <div >
              <TimeTable employeeId={user?.id} />
            </div>
          </div>

          {/* Right Column: CommunicationLogs + Reminder (define total height) */}
         <div className="flex flex-col gap-6 w-full max-w-[340px] mx-auto">
          <div>
            <CommunicationLogsCard
              commLogs={commLogs}
              commLoading={commLoading}
              onSeeAll={() => router.push('/dashboard/manager/chat')}
            />
          </div>
          <div>
            {/* <Remainder /> */}
          </div>
        </div>

        </div>
      </div>

      {/* TodayTask Popup Modal */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: '#00000099', backdropFilter: 'blur(30px)' }}
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-5xl w-full mx-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <TodayTask />
          </div>
        </div>
      )}
      
    </div>
  )
}
