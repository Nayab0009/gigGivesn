import { X, Phone, MapPin, Clock, MoreHorizontal } from "lucide-react"
import { colors } from "@/colors"

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
  team?: Team[]
}

interface CustomModalProps {
  manager: Manager
  onClose: () => void
  generateAvatar: (name: string, index: number) => string
}

const CustomModal = ({ manager, onClose, generateAvatar }: CustomModalProps) => {
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
                        src={manager.team?.[0]?.avatar || generateAvatar(manager.name, 0)}
                        alt={manager.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Dot inside the circle */}
                    <div
                      className="absolute right-1 bottom-1 w-6 h-6 rounded-full border-2"
                      style={{ background: colors.primary.hex, borderColor: "#0B0B0B" }}
                    />
                  </div>

                  <div>
                    <div className="text-white text-xl sm:text-2xl font-semibold">{manager.name}</div>
                    <div className="text-white -mt-0.5">UI/UX Designer</div>
                    <div className="mt-3 flex flex-col gap-4 text-white text-sm">
                      <div className="inline-flex items-center gap-2"><Phone className="w-4 h-4 text-white" /> {manager.phone}</div>
                      <div className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-white" /> {manager.address}</div>
                    </div>
                  </div>
                </div>
                {/* Mini task card */}
                <div
                  className="rounded-xl border p-4 w-full md:w-[260px]"
                  style={{ background: "#0B0B0B80", borderColor: "#FFFFFF26" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#0CA9F61A", color: colors.primary.hex }}>AER-001</div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] px-2 py-0.5 rounded-full bg-[#BD4242] text-white">High</div>
                    </div>
                  </div>
                  <div className="mt-2 text-white font-semibold">Aeronaa UI Design</div>
                  <div className="text-slate-300 text-sm ">Review Project Goals and Objective</div>
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
                    <div className="inline-flex items-center gap-2 text-slate-300 text-xs"><Clock className="w-4 h-4" /> 01h 52m</div>
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Tasks list */}
              <div className="mt-6 space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="rounded-xl border p-4 flex items-start justify-between" style={{ background: "#0B0B0B66", borderColor: "#FFFFFF26" }}>
                    <div>
                      <div className="text-white font-medium">Aeronaa UI Design</div>
                      <div className="text-slate-300 text-sm">Review Project Goals and Objective</div>
                      <div className="mt-2 inline-flex items-center gap-2 text-slate-400 text-xs"><Clock className="w-4 h-4" /> 01h 52m</div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-[10px] px-2 py-0.5 rounded-full bg-[#BD4242] text-white">High</div>
                      <div className="flex -space-x-2">
                        {[0,1,2].map((j) => (
                          <img 
                            key={j} 
                            className="w-7 h-7 rounded-full border border-black" 
                            src={generateAvatar(`${manager.name}-${i}-${j}`, j)}
                            alt={`team member ${j}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomModal
