"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShowEmployee } from "@/lib/TeamService"
import { sendMessage as fetchChatHistoryAPI } from "@/lib/chatService"
import {
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import axiosInstance from "@/lib/axios"
import { useAuth } from "@/context/AuthContext" 



import TimeTable from "./TimeTable"
import { getManagerTasksToday } from "@/lib/TaskService"
import TodayTask from "./TodayTask"
import HeaderSection from "./HeaderSection"
import TodayTasksSection from "./TodayTasksSection"
import ProjectStatusCard from "./ProjectStatusCard"
import CommunicationLogsCard from "./CommunicationLogsCard"




export default function ManagerDashboard() {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [commLogs, setCommLogs] = useState<any[]>([]);
  const [commLoading, setCommLoading] = useState(false);
  const router = useRouter();

  // Fetch Today Tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setTasksLoading(true);
      try {
        const data = await getManagerTasksToday();
        const priorityBuckets: Record<string, any[]> = { high: [], medium: [], low: [], other: [] };
        if (Array.isArray(data)) {
          data.forEach(task => {
            const p = String(task.priority || '').toLowerCase();
            if (p === 'high') priorityBuckets.high.push(task);
            else if (p === 'medium') priorityBuckets.medium.push(task);
            else if (p === 'low') priorityBuckets.low.push(task);
            else priorityBuckets.other.push(task);
          });
        }
        const result: any[] = [];
        if (priorityBuckets.high.length) result.push(priorityBuckets.high[0]);
        if (priorityBuckets.medium.length) result.push(priorityBuckets.medium[0]);
        if (priorityBuckets.low.length) result.push(priorityBuckets.low[0]);
        const usedIds = new Set(result.map(t => t.id));
        const allRemaining = [...priorityBuckets.high.slice(1), ...priorityBuckets.medium.slice(1), ...priorityBuckets.low.slice(1), ...priorityBuckets.other];
        for (const t of allRemaining) {
          if (result.length >= 3) break;
          if (!usedIds.has(t.id)) result.push(t);
        }
        setTodayTasks(result);
      } catch {
        setTodayTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchManagerProjects = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get('/projects/manager/all');
        const projectsData = Array.isArray(response.data) ? response.data : [];
        setProjects(projectsData);
        const totalProjects = projectsData.length;
        // Normalize status for robust counting
        const normalizeStatus = (status: string) => status?.toLowerCase().replace(/[-_\s]/g, "");
        const activeProjects = projectsData.filter((p: any) => {
          const s = normalizeStatus(p.status || "");
          return s === 'active' || s === 'inprogress';
        }).length;
        const completedProjects = projectsData.filter((p: any) => normalizeStatus(p.status || "") === 'completed').length;
        // If you want backlog count, add here:
        // const backlogProjects = projectsData.filter((p: any) => normalizeStatus(p.status || "") === 'backlog').length;
        setAnalytics({ totalProjects, activeProjects, completedProjects });
      } catch (error) {
        setError("Failed to load projects. Please try again.");
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchManagerProjects();
  }, [user?.id]);

  // Fetch Communication Logs
  useEffect(() => {
    const fetchCommLogs = async () => {
      if (!user?.id || !user?.role) return;
      setCommLoading(true);
      try {
        const contactRole = user.role === "manager" ? "employee" : "manager";
        const response = await ShowEmployee(contactRole);
        console.log('ShowEmployee response:', response);
        const contacts = Array.isArray(response?.data?.[0]) ? response.data[0].slice(0, 4) : [];
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
        setCommLogs(logs);
      } catch (e) {
        setCommLogs([]);
      } finally {
        setCommLoading(false);
      }
    };
    fetchCommLogs();
  }, [user?.id, user?.role]);

  // Priority counts for TodayTasksSection
  const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
  const sortedTodayTasks = [...todayTasks].sort((a, b) => {
    const pa = priorityOrder[String(a.priority).toLowerCase()] || 99;
    const pb = priorityOrder[String(b.priority).toLowerCase()] || 99;
    if (pa !== pb) return pa - pb;
    return 0;
  });
  const highCount = todayTasks.filter(t => t.priority?.toLowerCase() === "high").length;
  const mediumCount = todayTasks.filter(t => t.priority?.toLowerCase() === "medium").length;
  const lowCount = todayTasks.filter(t => t.priority?.toLowerCase() === "low").length;
  const totalCount = todayTasks.length || 1;
  const handleViewAllClick = () => setIsPopupOpen(true);



  return (
    <div className="min-h-screen pb-12 text-white rounded-2xl">
      {/* Header */}
      <HeaderSection userName={user?.name} />

      {/* Error Message */}
      <div className="mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Today Task Section */}
      <div className="w-full mx-auto mb-6">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Today Task + Timetable */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8 w-full">
            <TodayTasksSection
              tasks={todayTasks}
              tasksLoading={tasksLoading}
              highCount={highCount}
              mediumCount={mediumCount}
              lowCount={lowCount}
              totalCount={totalCount}
              onViewAll={handleViewAllClick}
            />
            {/* Timetable directly below Today Task */}
            <div
              className="rounded-2xl border border-blue-200/30 bg-black/30 overflow-auto scrollbar-none"
              style={{ minHeight: '300px', maxHeight: '420px', scrollbarWidth: 'none' }}
            >
              <TimeTable />
            </div>
          </div>

          {/* Right column: Project Status + Communication Logs stacked */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-8 w-full">
            <ProjectStatusCard analytics={analytics} />
            <CommunicationLogsCard
              commLogs={commLogs}
              commLoading={commLoading}
              onSeeAll={() => router.push('/dashboard/manager/chat')}
            />
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
  );
}
