import Image from "next/image"
import { BarChart3, CheckCircle, Clock, FolderKanban, User, ListTodo, TrendingUp, Plus, FileText, Star, Calendar, MessageSquare, Target, Timer } from 'lucide-react'

const analytics = [
  {
    label: "Tasks Completed",
    value: 27,
    icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
    color: "bg-emerald-50 text-emerald-800",
    cardBg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
  },
  {
    label: "Active Projects",
    value: 3,
    icon: <FolderKanban className="h-6 w-6 text-teal-600" />,
    color: "bg-teal-50 text-teal-800",
    cardBg: "bg-gradient-to-br from-teal-50 to-teal-100",
  },
  {
    label: "Hours This Week",
    value: 32,
    icon: <Timer className="h-6 w-6 text-blue-600" />,
    color: "bg-blue-50 text-blue-800",
    cardBg: "bg-gradient-to-br from-blue-50 to-blue-100",
  },
  {
    label: "Team Rating",
    value: "4.8",
    icon: <Star className="h-6 w-6 text-amber-600" />,
    color: "bg-amber-50 text-amber-800",
    cardBg: "bg-gradient-to-br from-amber-50 to-amber-100",
  },
]

const tasks = [
  {
    id: 1,
    title: "Review UI Components",
    status: "Completed",
    due: "2025-06-12",
    project: "Website Redesign",
    priority: "High",
    cardBg: "bg-gradient-to-r from-emerald-50 to-green-50",
  },
  {
    id: 2,
    title: "Implement Authentication",
    status: "In Progress",
    due: "2025-06-15",
    project: "Internal Portal",
    priority: "Medium",
    cardBg: "bg-gradient-to-r from-blue-50 to-cyan-50",
  },
  {
    id: 3,
    title: "Database Migration Script",
    status: "Pending",
    due: "2025-06-20",
    project: "Analytics Dashboard",
    priority: "Low",
    cardBg: "bg-gradient-to-r from-slate-50 to-gray-50",
  },
  {
    id: 4,
    title: "Team Standup Meeting",
    status: "Scheduled",
    due: "2025-06-16",
    project: "General",
    priority: "Medium",
    cardBg: "bg-gradient-to-r from-purple-50 to-indigo-50",
  },
]

const projects = [
  {
    id: 1,
    name: "Website Redesign",
    progress: 85,
    status: "Active",
    team: 5,
    color: "bg-emerald-500",
    role: "Frontend Developer",
  },
  {
    id: 2,
    name: "Analytics Dashboard",
    progress: 62,
    status: "Active",
    team: 3,
    color: "bg-teal-500",
    role: "Full Stack Developer",
  },
  {
    id: 3,
    name: "HR Platform",
    progress: 38,
    status: "Active",
    team: 4,
    color: "bg-emerald-600",
    role: "Backend Developer",
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Sprint Planning",
    time: "10:00 AM",
    date: "Today",
    type: "meeting",
  },
  {
    id: 2,
    title: "Code Review Session",
    time: "2:00 PM",
    date: "Tomorrow",
    type: "review",
  },
  {
    id: 3,
    title: "Project Deadline",
    time: "EOD",
    date: "Jun 20",
    type: "deadline",
  },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50 pb-12">
      {/* Header Hero */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-10 rounded-b-3xl shadow-xl ml-6 mr-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Image
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User Avatar"
              width={64}
              height={64}
              className="rounded-full shadow-lg border-4 border-white"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome back, Saad!</h1>
              <p className="text-emerald-200 text-sm md:text-base mt-1">Ready to tackle today's challenges?</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-2 bg-white text-emerald-700 rounded-xl font-semibold shadow hover:bg-emerald-50 transition">
              <Plus className="h-5 w-5" /> New Task
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-emerald-500 rounded-xl font-semibold shadow hover:bg-emerald-600 transition">
              <Calendar className="h-5 w-5" /> View Calendar
            </button>
          </div>
        </div>
      </header>

      {/* Analytics Overview */}
      <section className="max-w-7xl mx-auto px-10 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {analytics.map((a) => (
          <div
            key={a.label}
            className={`${a.cardBg} rounded-2xl shadow-lg flex flex-col items-center py-6 px-4 hover:shadow-xl transition group border border-white/50`}
          >
            <div className={`${a.color} rounded-full p-3 mb-2`}>{a.icon}</div>
            <div className="text-3xl font-bold group-hover:text-emerald-700 transition text-gray-800">{a.value}</div>
            <div className="text-gray-600 text-sm mt-1 font-medium">{a.label}</div>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-10 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Tasks */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
            <a href="#" className="text-emerald-600 hover:underline text-sm font-medium">
              View all tasks
            </a>
          </div>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`${task.cardBg} rounded-xl shadow-lg flex items-center justify-between p-5 hover:shadow-xl transition border border-white/50`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{task.title}</div>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-emerald-500" />
                      {task.project}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" />
                      Due: {task.due}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      task.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : task.status === "In Progress"
                          ? "bg-teal-100 text-teal-700"
                          : task.status === "Scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.status === "Completed" ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : task.status === "In Progress" ? (
                    <TrendingUp className="h-5 w-5 text-teal-500" />
                  ) : task.status === "Scheduled" ? (
                    <Calendar className="h-5 w-5 text-blue-500" />
                  ) : (
                    <ListTodo className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* My Projects */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl shadow-lg px-6 py-8 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">My Projects</h2>
              <a href="#" className="text-emerald-600 text-xs font-medium hover:underline">
                View all
              </a>
            </div>
            <div className="space-y-5">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${project.color}`} />
                      {project.name}
                    </span>
                    <span className="text-xs text-gray-500">{project.team} members</span>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mb-2">{project.role}</div>
                  <div className="w-full h-2 bg-white/60 rounded-full">
                    <div
                      className={`${project.color} h-2 rounded-full transition-all`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{project.progress}% complete</span>
                    <span>{project.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl shadow-lg px-6 py-8 border border-white/50">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Upcoming</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/40 transition">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      event.type === "meeting"
                        ? "bg-emerald-500"
                        : event.type === "review"
                          ? "bg-teal-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{event.title}</div>
                    <div className="text-xs text-gray-600">
                      {event.date} at {event.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-lg px-6 py-7 text-white">
            <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Team Chat</span>
              </button>
              <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">Set Goals</span>
              </button>
              <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Time Tracking</span>
              </button>
              <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">Profile Settings</span>
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
