import Image from "next/image";
import {
  BarChart3,
  CheckCircle,
  Clock,
  FolderKanban,
  User,
  ListTodo,
  TrendingUp,
  Plus,
  ArrowRight,
  FileText,
  Star,
} from "lucide-react";

const analytics = [
  {
    label: "Tasks Completed",
    value: 27,
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    color: "bg-green-100 text-green-700",
  },
  {
    label: "Active Projects",
    value: 3,
    icon: <FolderKanban className="h-6 w-6 text-blue-500" />,
    color: "bg-blue-100 text-blue-700",
  },
  {
    label: "Hours Logged",
    value: 134,
    icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    label: "Avg. Task Rating",
    value: "4.7",
    icon: <Star className="h-6 w-6 text-yellow-400" />,
    color: "bg-yellow-100 text-yellow-700",
  },
];

const tasks = [
  {
    id: 1,
    title: "Design Standup Notes",
    status: "Completed",
    due: "2025-06-12",
    project: "Website Redesign",
  },
  {
    id: 2,
    title: "Test login page",
    status: "In Progress",
    due: "2025-06-15",
    project: "Internal Portal",
  },
  {
    id: 3,
    title: "Q2 Analytics Report",
    status: "Pending",
    due: "2025-06-20",
    project: "Analytics Dashboard",
  },
];

const projects = [
  {
    id: 1,
    name: "Website Redesign",
    progress: 85,
    status: "Active",
    team: 5,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Analytics Dashboard",
    progress: 62,
    status: "Active",
    team: 3,
    color: "bg-indigo-500",
  },
  {
    id: 3,
    name: "HR Platform",
    progress: 38,
    status: "Active",
    team: 4,
    color: "bg-purple-500",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 pb-12">
      {/* Header Hero */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white px-6 py-10 rounded-b-3xl shadow-xl">
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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome, Saad Mustafa</h1>
              <p className="text-blue-200 text-sm md:text-base mt-1">Your productivity at a glance</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-2 bg-white text-blue-800 rounded-xl font-semibold shadow hover:bg-blue-50 transition">
              <Plus className="h-5 w-5" /> New Task
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-blue-700 rounded-xl font-semibold shadow hover:bg-blue-800 transition">
              <ArrowRight className="h-5 w-5" /> Go to Projects
            </button>
          </div>
        </div>
      </header>

      {/* Analytics Overview */}
      <section className="max-w-7xl mx-auto px-4 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {analytics.map(a => (
          <div
            key={a.label}
            className={`rounded-2xl shadow bg-white flex flex-col items-center py-6 px-4 hover:shadow-lg transition group`}
          >
            <div className={`${a.color} rounded-full p-3 mb-2`}>{a.icon}</div>
            <div className="text-3xl font-bold group-hover:text-blue-800 transition">{a.value}</div>
            <div className="text-gray-500 text-sm mt-1">{a.label}</div>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Tasks */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
            <a href="#" className="text-blue-700 hover:underline text-sm font-medium">
              View all tasks
            </a>
          </div>
          <div className="space-y-6">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow flex items-center justify-between p-5 hover:shadow-lg transition"
              >
                <div>
                  <div className="font-semibold text-gray-900">{task.title}</div>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    <span>
                      <FileText className="inline h-4 w-4 mr-1 text-blue-300" />
                      {task.project}
                    </span>
                    <span>
                      <Clock className="inline h-4 w-4 mr-1 text-yellow-400" />
                      Due: {task.due}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      task.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : task.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.status === "Completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : task.status === "In Progress" ? (
                    <TrendingUp className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <ListTodo className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
            {/* Empty state */}
            {tasks.length === 0 && (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <ListTodo className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <div className="text-gray-700 font-semibold">No tasks for today!</div>
              </div>
            )}
          </div>
        </section>

        {/* Projects Sidebar */}
        <aside>
          <div className="bg-white rounded-2xl shadow px-6 py-8 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Active Projects</h2>
              <a href="#" className="text-blue-700 text-xs font-medium hover:underline">
                All projects
              </a>
            </div>
            <div className="space-y-5">
              {projects.map(project => (
                <div key={project.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${project.color}`} />
                      {project.name}
                    </span>
                    <span className="text-xs text-gray-400">{project.team} members</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className={`${project.color} h-2 rounded-full transition-all`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{project.progress}%</span>
                    <span>{project.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Quick Links or Announcements */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow px-6 py-7 text-white">
            <h3 className="font-semibold text-lg mb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:underline flex items-center gap-2">
                  <User className="h-4 w-4" /> Profile Settings
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Timesheets
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" /> Project Board
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline flex items-center gap-2">
                  <FileText className="h-4 w-4" /> HR Policies
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}