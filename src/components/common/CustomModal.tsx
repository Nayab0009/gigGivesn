import { X, Phone, MapPin, Clock } from "lucide-react"
import { colors } from "@/colors"
import { getEmployeeById } from "@/lib/TeamService"
import { getTasksByStatus } from "@/lib/TaskService"
import { useEffect, useState } from "react"

interface Team {
  name: string
  role?: string
  avatar?: string
}

interface Manager {
  id?: string
  name: string
  email: string
  phone: string
  address: string
  role?: string
  avatar?: string | null
  isActive?: boolean
  industry?: string
  team?: Team[]
}

interface TaskOf {
  id: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  logo: string
}

interface Task {
  id: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  title: string
  description: string
  status: string
  comment: string | null
  taskDate: string
  ticketNumber: string
  priority: string
  taskOf: TaskOf
}

interface CustomModalProps {
  manager: Manager
  onClose: () => void
  generateAvatar: (name: string, index: number) => string
}

const CustomModal = ({ manager, onClose, generateAvatar }: CustomModalProps) => {
  const [employeeData, setEmployeeData] = useState<Manager | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [completedTask, setCompletedTask] = useState<Task | null>(null)
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!manager.id) return
      try {
        const data = await getEmployeeById(manager.id)
        setEmployeeData(data)
      } catch (error) {
        console.error("Error fetching employee data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployeeData()
  }, [manager.id])
  
  useEffect(() => {
    const fetchTasks = async () => {
      if (!manager.id) return;
      
      try {
        setTasksLoading(true)
        // Fetch all tasks for this manager
        const managerTasks = await getTasksByStatus(manager.id)
        
        // Filter completed tasks
        const completedTasks = managerTasks.filter((task: Task) => task.status === 'completed')
        // Get the latest completed task (sorted by updatedAt)
        const sortedCompletedTasks = completedTasks.sort((a: Task, b: Task) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        if (sortedCompletedTasks.length > 0) {
          setCompletedTask(sortedCompletedTasks[0])
        }
        
        // Filter in-progress tasks
        const inProgressTasksData = managerTasks.filter((task: Task) => task.status === 'inprogress')
        setInProgressTasks(inProgressTasksData)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setTasksLoading(false)
      }
    }
    
    fetchTasks()
  }, [manager.id])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 [background:var(--container-bg)]   backdrop-blur-sm">
      <div
        className="w-full max-w-3xl max-h-[80vh] rounded-2xl border shadow-2xl overflow-y-auto custom-scrollbar [background:var(--container-bg)] "
        style={{
        
          borderColor: "#FFFFFF26",
          boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
        }}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.12);
            border-radius: 8px;
            border: 2px solid rgba(255,255,255,0.08);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.18);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.12) transparent;
          }
        `}</style>
        {/* Top bar close */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-white/10 transition"
            title="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:p-8">
          {/* Main panel now fills all columns */}
          <div>
            <div
              className="rounded-2xl border p-5 sm:p-6 lg:p-7 [background:var(--container-bg)] "
              style={{  borderColor: "#FFFFFF26" }}
            >
              {/* Header profile + mini task */}
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : employeeData ? (
                    <>
                      <div className="relative">
                        <div
                          className="w-[120px] h-[120px] rounded-full overflow-hidden border-2"
                          style={{ borderColor: "white" }}
                        >
                          <img
                            src={employeeData.avatar || generateAvatar(employeeData.name, 0)}
                            alt={employeeData.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Dot inside the circle */}
                        <div
                          className="absolute right-1 bottom-1 w-6 h-6 rounded-full border-2"
                          style={{ 
                            background: employeeData.isActive ? colors.primary.hex : '#666',
                            borderColor: "#0B0B0B"
                          }}
                        />
                      </div>

                      <div>
                        <div className="text-text-main text-xl sm:text-2xl font-semibold">{employeeData.name}</div>
                        <div className="text-text-main -mt-0.5 capitalize">{employeeData.role || 'Employee'} - {employeeData.industry || 'N/A'}</div>
                        <div className="mt-3 flex flex-col gap-4 text-text-main text-sm">
                          <div className="inline-flex items-center gap-2"><Phone className="w-4 h-4 text-text-main" /> {employeeData.phone}</div>
                          <div className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-text-main" /> {employeeData.address}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className="w-[120px] h-[120px] rounded-full overflow-hidden border-2"
                          style={{ borderColor: "white" }}
                        >
                          <img
                            src={generateAvatar(manager.name, 0)}
                            alt={manager.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-white text-xl sm:text-2xl font-semibold">{manager.name}</div>
                        <div className="mt-3 flex flex-col gap-4 text-white text-sm">
                          <div className="inline-flex items-center gap-2"><Phone className="w-4 h-4 text-white" /> {manager.phone}</div>
                          <div className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-white" /> {manager.address}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Mini task card */}
                <div
                  className="rounded-xl border p-4 w-full md:w-[260px] [background:var(--container-bg)] "
                  style={{  borderColor: "#FFFFFF26" }}
                >
                  {tasksLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  ) : completedTask ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] px-2 py-0.5 rounded-full" 
                             style={{ background: "#0CA9F61A", color: colors.primary.hex }}>
                          {completedTask.ticketNumber}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-[10px] px-2 py-0.5 rounded-full text-white ${
                            completedTask.priority === 'high' ? 'bg-[#BD4242]' : 
                            completedTask.priority === 'medium' ? 'bg-[#E79E2D]' : 
                            'bg-[#3D8A95]'
                          }`}>
                            {completedTask.priority.charAt(0).toUpperCase() + completedTask.priority.slice(1)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-text-secondary font-semibold">{completedTask.title}</div>
                      <div className="text-slate-300 text-sm ">{completedTask.description}</div>
                      <div className="flex -space-x-2 mt-2">
                        {[0,1,2,3].slice(0, (manager.team?.length || 3)).map((i) => (
                          <img
                            key={i}
                            className="w-7 h-7 rounded-full border border-black"
                            src={manager.team?.[i]?.avatar || generateAvatar(`${manager.name}-${i}`, i)}
                            alt="team"
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-slate-300 text-xs">
                          <Clock className="w-4 h-4" /> 
                          {new Date(completedTask.taskDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] px-2 py-0.5 rounded-full bg-green-600 text-white">
                          Completed
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-text-secondary">
                      <div>No completed tasks found</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks list */}
              <div className="mt-6 space-y-4">
                <h3 className="text-text-main font-semibold text-lg">In-progress Tasks</h3>
                {tasksLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : inProgressTasks.length > 0 ? (
                  inProgressTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="rounded-xl border p-4 flex items-start justify-between [background:var(--container-bg)] " 
                      style={{  borderColor: "#FFFFFF26" }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-white font-medium">{task.title}</div>
                          <div className="text-[11px] px-2 py-0.5 rounded-full" 
                               style={{ background: "#0CA9F61A", color: colors.primary.hex }}>
                            {task.ticketNumber}
                          </div>
                        </div>
                        <div className="text-text-secondary text-sm">{task.description}</div>
                        <div className="mt-2 inline-flex items-center gap-2 text-slate-400 text-xs">
                          <Clock className="w-4 h-4" /> 
                          {new Date(task.taskDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className={`text-[10px] px-2 py-0.5 rounded-full text-white ${
                          task.priority === 'high' ? 'bg-[#BD4242]' : 
                          task.priority === 'medium' ? 'bg-[#E79E2D]' : 
                          'bg-[#3D8A95]'
                        }`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </div>
                        <div className="flex -space-x-2">
                          {[0,1,2].map((j) => (
                            <img 
                              key={j} 
                              className="w-7 h-7 rounded-full border border-black" 
                              src={generateAvatar(`${task.title}-${j}`, j)}
                              alt={`team member ${j}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-24 text-text-secondary">
                    <div>No in-progress tasks found</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomModal
