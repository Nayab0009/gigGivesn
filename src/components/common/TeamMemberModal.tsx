import { X, Phone, MapPin, Clock, MoreHorizontal } from "lucide-react"
import { colors } from "@/colors"
import { useEffect, useState } from "react"
import { getTasksByEmployeeId } from "@/lib/TaskService"

interface Team {
  name: string
  role?: string
  avatar?: string
}

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  taskDate: string
  ticketNumber: string | null
  createdAt: string
  updatedAt: string
  isActive: boolean
  comment: string | null
  taskOf: {
    name: string
  }
}

interface TeamMember {
  id?: string
  name: string
  email: string
  phone: string
  address: string
  role?: string
  industry?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  avatar?: string | null
  team?: Team[]
}

interface TeamMemberModalProps {
  teamMember: TeamMember
  onClose: () => void
  generateAvatar: (name: string, index: number) => string
}

const TeamMemberModal = ({ teamMember, onClose, generateAvatar }: TeamMemberModalProps) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  
  console.log('TeamMemberModal Props:', teamMember); // Debug log

  useEffect(() => {
    const fetchTasks = async () => {
      if (!teamMember.id) return;
      try {
        const response = await getTasksByEmployeeId(teamMember.id)
        setTasks(response)
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  // Filter tasks that are in progress
  const inProgressTasks = tasks.filter(task => task.status.toLowerCase() === 'inprogress')

  // Get the latest completed task
  const latestCompletedTask = tasks
    .filter(task => task.status.toLowerCase() === 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl max-h-[80vh] rounded-2xl border shadow-2xl overflow-y-auto custom-scrollbar"
        style={{
          background: "rgba(0,0,0,0.55)",
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
              className="rounded-2xl border p-5 sm:p-6 lg:p-7"
              style={{ background: "#00000066", borderColor: "#FFFFFF26" }}
            >
              {/* Header profile + mini task */}
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className="w-[120px] h-[120px] rounded-full overflow-hidden border-2"
                      style={{ borderColor: "white" }}
                    >
                      <img
                        src={teamMember.avatar || generateAvatar(teamMember.name, 0)}
                        alt={teamMember.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Active Status Indicator */}
                    <div
                      className={`absolute right-1 bottom-1 w-6 h-6 rounded-full border-2 ${
                        teamMember.isActive ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                      style={{ borderColor: "#0B0B0B" }}
                    />
                  </div>

                  <div>
                    <div className="text-white text-xl sm:text-2xl font-semibold">{teamMember.name}</div>
                    <div className="flex items-center gap-2 -mt-0.5">
                      <div className="text-white capitalize">{teamMember.role || 'Team Member'}</div>
                      {teamMember.industry && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 capitalize">
                          {teamMember.industry}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-col gap-4 text-white text-sm">
                      <div className="inline-flex items-center gap-2">
                        <Phone className="w-4 h-4 text-white" /> 
                        {teamMember.phone || 'Not provided'}
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-white" /> 
                        {teamMember.address}
                      </div>
                    
                    </div>
                  </div>
                </div>
                {/* Mini task card - Latest Completed Task */}
                {latestCompletedTask && (
                  <div
                    className="rounded-xl border p-4 w-full md:w-[260px]"
                    style={{ background: "#0B0B0B80", borderColor: "#FFFFFF26" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#0CA9F61A", color: colors.primary.hex }}>
                        {latestCompletedTask.ticketNumber || 'No Ticket'}
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="text-[10px] px-2 py-0.5 rounded-full text-white"
                          style={{
                            background: latestCompletedTask.priority === 'high' 
                              ? '#BD4242' 
                              : latestCompletedTask.priority === 'medium'
                              ? '#F6B500'
                              : '#22C55E'
                          }}
                        >
                          {latestCompletedTask.priority}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-white font-semibold">{latestCompletedTask.title}</div>
                    <div className="text-slate-300 text-sm ">{latestCompletedTask.description}</div>
                    <div className="flex -space-x-2 mt-2">
                      {[0].map((i) => (
                        <img
                          key={i}
                          className="w-7 h-7 rounded-full border border-black"
                          src={teamMember.team?.[0]?.avatar || generateAvatar(teamMember.name, 0)}
                          alt="team"
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-slate-300 text-xs">
                        <Clock className="w-4 h-4" />
                        {new Date(latestCompletedTask.taskDate).toLocaleDateString()}
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Tasks list */}
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="text-white text-center p-4">Loading tasks...</div>
                ) : inProgressTasks.length > 0 ? (
                  inProgressTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="rounded-xl border p-4 flex items-start justify-between" 
                      style={{ background: "#0B0B0B66", borderColor: "#FFFFFF26" }}
                    >
                      <div>
                        <div className="text-white font-medium">{task.title}</div>
                        <div className="text-slate-300 text-sm">{task.description}</div>
                        <div className="mt-2 inline-flex items-center gap-2 text-slate-400 text-xs">
                          <Clock className="w-4 h-4" />
                          {new Date(task.taskDate).toLocaleDateString()}
                          {task.ticketNumber && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full" 
                              style={{ background: "#0CA9F61A", color: colors.primary.hex }}>
                              {task.ticketNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div 
                          className="text-[10px] px-2 py-0.5 rounded-full text-white"
                          style={{
                            background: task.priority === 'high' 
                              ? '#BD4242' 
                              : task.priority === 'medium'
                              ? '#F6B500'
                              : '#22C55E'
                          }}
                        >
                          {task.priority}
                        </div>
                        <div className="flex -space-x-2">
                          <img 
                            className="w-7 h-7 rounded-full border border-black" 
                            src={teamMember.team?.[0]?.avatar || generateAvatar(teamMember.name, 0)}
                            alt="team member"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white text-center p-4">No in-progress tasks</div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamMemberModal
