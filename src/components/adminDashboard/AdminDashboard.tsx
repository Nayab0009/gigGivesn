"use client"
import { useEffect, useState } from "react"
import {
  Users,
  ClipboardList,
  CheckSquare,
  Briefcase,
  ArrowUpRight,
  MoreHorizontal,
  Download,
  BarChart3,
  PieChart,
  Globe,
  Activity,
} from "lucide-react"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart,
  BarChart
} from "recharts"

// --- Types aligned to project management context ---
interface DashboardData {
  adminStats: {
    totalProjects: number
    totalTasks: number
    totalUsers: number
    tasksCompleted: number
    openBugs: number
  }
  projectProgress: Array<{
    month: string
    completedTasks: number
    createdTasks: number
    year: number
  }>
  teamActivity: Array<{
    team: string
    tasks: number
    completed: number
    efficiency: number // percent
  }>
  recentActivities: Array<{
    id: string
    project: string
    user: string
    action: string
    date: string
    status: string
    type: string
  }>
}

// Modern, accessible color palette
const COLORS = [
  "#2563eb", // blue-600
  "#f59e42", // amber-400
  "#16a34a", // green-600
  "#f43f5e", // rose-500
  "#a21caf", // purple-800
  "#0ea5e9", // sky-500
]

// Card colors for dashboard metrics (gradient backgrounds)
const cardGradients = [
  "from-[#2563eb] to-[#1e40af]", // blue
  "from-[#f59e42] to-[#ea580c]", // amber
  "from-[#16a34a] to-[#166534]", // green
  "from-[#f43f5e] to-[#be123c]", // rose
  "from-[#a21caf] to-[#581c87]", // purple
]

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    adminStats: {
      totalProjects: 0,
      totalTasks: 0,
      totalUsers: 0,
      tasksCompleted: 0,
      openBugs: 0,
    },
    projectProgress: [],
    teamActivity: [],
    recentActivities: [],
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setTimeout(() => {
        setDashboardData({
          adminStats: {
            totalProjects: 18,
            totalTasks: 1250,
            totalUsers: 47,
            tasksCompleted: 1075,
            openBugs: 16,
          },
          projectProgress: [
            { month: "Jan", completedTasks: 88, createdTasks: 110, year: 2024 },
            { month: "Feb", completedTasks: 94, createdTasks: 115, year: 2024 },
            { month: "Mar", completedTasks: 101, createdTasks: 120, year: 2024 },
            { month: "Apr", completedTasks: 99, createdTasks: 122, year: 2024 },
            { month: "May", completedTasks: 112, createdTasks: 130, year: 2024 },
            { month: "Jun", completedTasks: 125, createdTasks: 138, year: 2024 },
            { month: "Jul", completedTasks: 119, createdTasks: 136, year: 2024 },
            { month: "Aug", completedTasks: 107, createdTasks: 125, year: 2024 },
            { month: "Sep", completedTasks: 114, createdTasks: 132, year: 2024 },
            { month: "Oct", completedTasks: 128, createdTasks: 142, year: 2024 },
            { month: "Nov", completedTasks: 129, createdTasks: 144, year: 2024 },
            { month: "Dec", completedTasks: 119, createdTasks: 130, year: 2024 },
          ],
          teamActivity: [
            { team: "Frontend", tasks: 320, completed: 295, efficiency: 92 },
            { team: "Backend", tasks: 260, completed: 238, efficiency: 91 },
            { team: "QA", tasks: 180, completed: 173, efficiency: 96 },
            { team: "Design", tasks: 120, completed: 115, efficiency: 96 },
            { team: "DevOps", tasks: 100, completed: 87, efficiency: 87 },
          ],
          recentActivities: [
            {
              id: "ACT-001",
              project: "Website Redesign",
              user: "Sarah Williams",
              action: "Closed Task #425",
              date: "2024-05-28",
              status: "completed",
              type: "task",
            },
            {
              id: "ACT-002",
              project: "API Development",
              user: "Mike Johnson",
              action: "Reported Bug #233",
              date: "2024-05-27",
              status: "open",
              type: "bug",
            },
            {
              id: "ACT-003",
              project: "Mobile App",
              user: "Lisa Chen",
              action: "Deployed v1.2.3",
              date: "2024-05-26",
              status: "completed",
              type: "deployment",
            },
            {
              id: "ACT-004",
              project: "QA Sprint",
              user: "David Brown",
              action: "Tested Feature #99",
              date: "2024-05-25",
              status: "in-progress",
              type: "test",
            },
            {
              id: "ACT-005",
              project: "Website Redesign",
              user: "Emma Davis",
              action: "Created Task #426",
              date: "2024-05-24",
              status: "pending",
              type: "task",
            },
          ],
        })
        setIsLoading(false)
      }, 1000)
    }
    fetchDashboardData()
  }, [])

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num)

  // Updated color functions for better vibrance and contrast
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "in-progress":
        return "bg-sky-100 text-sky-800 border-sky-300"
      case "open":
        return "bg-rose-100 text-rose-800 border-rose-300"
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-300"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-sky-100 text-sky-800 border-sky-300"
      case "bug":
        return "bg-rose-100 text-rose-800 border-rose-300"
      case "deployment":
        return "bg-green-100 text-green-800 border-green-300"
      case "test":
        return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300"
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-300"
    }
  }

  const pieData = [
    { name: "Completed", value: dashboardData.adminStats.tasksCompleted },
    { name: "Open", value: dashboardData.adminStats.totalTasks - dashboardData.adminStats.tasksCompleted },
    { name: "Bugs", value: dashboardData.adminStats.openBugs },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-indigo-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8 pt-4 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2563eb] mb-1 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-600 text-lg">Welcome back! See your latest project insights below.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button className="px-4 py-2 bg-white text-[#2563eb] border border-[#2563eb] rounded-lg hover:bg-[#2563eb] hover:text-white shadow transition-all font-semibold text-sm">
            Export Report
          </button>
          <button className="px-4 py-2 bg-gradient-to-br from-[#2563eb] to-[#16a34a] text-white rounded-lg hover:opacity-90 transition-all shadow font-semibold text-sm">
            New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Projects */}
        <div className={`bg-gradient-to-br ${cardGradients[0]} rounded-2xl p-7 shadow-md group border border-blue-100`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpRight className="w-4 h-4 text-green-200" />
              <span className="text-green-100 text-sm font-bold">+2</span>
            </div>
          </div>
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-white mb-1">
              {formatNumber(dashboardData.adminStats.totalProjects)}
            </p>
            <p className="text-blue-50 text-xs">Active projects</p>
          </div>
        </div>
        {/* Total Tasks */}
        <div className={`bg-gradient-to-br ${cardGradients[1]} rounded-2xl p-7 shadow-md group border border-amber-100`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpRight className="w-4 h-4 text-green-200" />
              <span className="text-green-100 text-sm font-bold">+36</span>
            </div>
          </div>
          <div>
            <p className="text-amber-100 text-xs font-medium uppercase tracking-wider mb-1">Total Tasks</p>
            <p className="text-3xl font-bold text-white mb-1">
              {formatNumber(dashboardData.adminStats.totalTasks)}
            </p>
            <p className="text-amber-50 text-xs">All time</p>
          </div>
        </div>
        {/* Users */}
        <div className={`bg-gradient-to-br ${cardGradients[4]} rounded-2xl p-7 shadow-md group border border-purple-100`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpRight className="w-4 h-4 text-green-200" />
              <span className="text-green-100 text-sm font-bold">+4</span>
            </div>
          </div>
          <div>
            <p className="text-purple-100 text-xs font-medium uppercase tracking-wider mb-1">Users</p>
            <p className="text-3xl font-bold text-white mb-1">
              {formatNumber(dashboardData.adminStats.totalUsers)}
            </p>
            <p className="text-purple-50 text-xs">Active members</p>
          </div>
        </div>
        {/* Tasks Completed */}
        <div className={`bg-gradient-to-br ${cardGradients[2]} rounded-2xl p-7 shadow-md group border border-green-100`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <CheckSquare className="w-7 h-7 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpRight className="w-4 h-4 text-green-200" />
              <span className="text-green-100 text-sm font-bold">+17</span>
            </div>
          </div>
          <div>
            <p className="text-green-100 text-xs font-medium uppercase tracking-wider mb-1">Tasks Completed</p>
            <p className="text-3xl font-bold text-white mb-1">
              {formatNumber(dashboardData.adminStats.tasksCompleted)}
            </p>
            <p className="text-green-50 text-xs">Total done</p>
          </div>
        </div>
        {/* Open Bugs */}
        <div className={`bg-gradient-to-br ${cardGradients[3]} rounded-2xl p-7 shadow-md group border border-rose-100`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpRight className="w-4 h-4 text-green-200" />
              <span className="text-green-100 text-sm font-bold">-3</span>
            </div>
          </div>
          <div>
            <p className="text-rose-100 text-xs font-medium uppercase tracking-wider mb-1">Open Bugs</p>
            <p className="text-3xl font-bold text-white mb-1">
              {formatNumber(dashboardData.adminStats.openBugs)}
            </p>
            <p className="text-rose-50 text-xs">Unresolved</p>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Project Progress Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#2563eb] mb-2">Project Progress</h3>
              <p className="text-slate-600 text-sm">Monthly created vs completed tasks</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#16a34a] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dashboardData.projectProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
                <XAxis dataKey="month" stroke="#2563eb" fontSize={13} />
                <YAxis yAxisId="left" stroke="#f59e42" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#16a34a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="createdTasks" fill="#f59e42" name="Created Tasks" radius={[6, 6, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completedTasks"
                  stroke="#16a34a"
                  strokeWidth={4}
                  name="Completed Tasks"
                  dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow border border-green-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#16a34a] mb-2">Task Status Breakdown</h3>
              <p className="text-slate-600 text-sm">Open vs completed vs bugs</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#16a34a] to-[#f59e42] rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Activity Section */}
      <div className="bg-white rounded-2xl p-6 shadow border border-purple-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-[#a21caf] mb-2">Team Activity</h3>
            <p className="text-slate-600 text-sm">Task distribution and efficiency by team</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="w-10 h-10 bg-gradient-to-br from-[#a21caf] to-[#2563eb] rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* BarChart for Team Activity */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData.teamActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" fill="#a21caf" name="Tasks Assigned" radius={[6,6,0,0]} />
                <Bar dataKey="completed" fill="#2563eb" name="Tasks Completed" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-[#a21caf] mb-4">Efficiency by Team</h4>
            {dashboardData.teamActivity.map((team, index) => (
              <div
                key={team.team}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0
                        ? "bg-amber-500"
                        : index === 1
                        ? "bg-blue-400"
                        : index === 2
                        ? "bg-green-600"
                        : "bg-purple-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{team.team}</p>
                    <p className="text-xs text-gray-600">{team.tasks} tasks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">{team.efficiency}%</p>
                  <p className="text-xs text-gray-600">Efficiency</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-[#2563eb] mb-2">Recent Activities</h3>
              <p className="text-slate-600 text-sm">Latest actions across your projects</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button className="px-4 py-2 bg-gradient-to-br from-[#2563eb] to-[#16a34a] text-white rounded-lg hover:opacity-90 transition font-semibold text-sm shadow">
                View All
              </button>
              <button className="p-2 bg-white border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors shadow">
                <Download className="w-4 h-4 text-[#2563eb]" />
              </button>
            </div>
          </div>
        </div>
        {/* Mobile layout */}
        <div className="block lg:hidden">
          <div className="divide-y divide-slate-100">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-blue-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-[#2563eb] font-semibold mb-1">{activity.id}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{activity.project}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-1.5 text-gray-400 hover:text-[#2563eb] transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">User</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getTypeColor(activity.type)}`}>{activity.type}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Action</p>
                  <p className="text-sm text-gray-900">{activity.action}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}
                  >
                    {activity.status}
                  </span>
                  <span className="text-xs text-gray-600">{new Date(activity.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop Table Layout */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboardData.recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-[#2563eb] font-semibold">{activity.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-gray-900 truncate">{activity.project}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getTypeColor(activity.type)}`}>{activity.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>{activity.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-600">{new Date(activity.date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 text-gray-400 hover:text-[#2563eb] transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}