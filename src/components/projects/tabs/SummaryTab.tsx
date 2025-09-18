"use client"
import { Clock, ChevronDown, Users } from "lucide-react"
import { type MemberTaskCount, type ProjectTask } from "@/lib/ProjectService"

type SummaryTabProps = {
  project: {
    id: number
    name: string
    [key: string]: any
  }
  taskCounts: {
    totalTask: number
    inProgressTask: number
    completedTask: number
    cancelledTask: number
  }
  taskPriorities: {
    highTask: number
    lowTask: number
    mediumTask: number
  }
  memberTaskCounts: MemberTaskCount[]
  statCards: Array<{
    label: string
    value: number
    icon: JSX.Element
    subText: string
  }>
}

const SummaryTab = ({ 
  project, 
  taskCounts, 
  taskPriorities, 
  memberTaskCounts,
  statCards 
}: SummaryTabProps) => {
  return (
    <div className="space-y-6">
      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 p-6 shadow-md backdrop-blur-xl"
            style={{ background: "#0000004D" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-white/70 text-sm">{stat.label}</span>
                <span className="text-3xl font-bold text-white mt-1">
                  {stat.value}
                </span>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">{stat.icon}</div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">{stat.subText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Second row - two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-2xl border border-white/10 p-6 backdrop-blur-xl"
          style={{ background: "#0000004D" }}
        >
          <div className="text-lg font-semibold text-white mb-6">Task Priority</div>
          {/* Bar chart */}
          {(() => {
            // Chart setup
            const maxVal = Math.max(
              taskPriorities.highTask,
              taskPriorities.mediumTask,
              taskPriorities.lowTask,
              1
            )
            const topTick = Math.ceil(maxVal / 5) * 5 // Round to nearest 5
            const yTicks = Array.from({ length: 6 }, (_, i) => Math.round((i * topTick) / 5))
            const chartHeight = 200
            const scale = (value: number) => (value / topTick) * chartHeight

            return (
              <div className="grid grid-cols-[auto,1fr] grid-rows-[1fr,auto] gap-x-2 h-72">
                {/* Y-axis */}
                <div className="relative col-start-1 row-start-1 mr-4" style={{ height: chartHeight }}>
                  {/* Y-axis line */}
                  <div
                    className="absolute top-0 bottom-0 right-0"
                    style={{ width: 2, background: "#ffffff20", borderRadius: 2 }}
                  />

                  {/* Y-axis ticks and labels */}
                  {yTicks.map((t, i) => {
                    const pos = (t / topTick) * 100 // percentage from bottom
                    return (
                      <div
                        key={`tick-${i}`}
                        className="absolute text-white/90 text-xs"
                        style={{
                          bottom: `${pos}%`,
                          right: 8,
                          transform: "translateY(50%)",
                        }}
                      >
                        {t}
                      </div>
                    )
                  })}
                </div>

                {/* Bars area */}
                <div
                  className="relative col-start-2 row-start-1 flex items-end justify-around"
                  style={{ height: chartHeight }}
                >
                  {/* X-axis line (only here) */}
                  <div
                    className="absolute left-0 right-0 bottom-0"
                    style={{ height: 2, background: "#ffffff", borderRadius: 2 }}
                  />

                  {[
                    { priority: "High Task", value: taskPriorities.highTask, color: "#34D399" },
                    { priority: "Medium Task", value: taskPriorities.mediumTask, color: "#0CA9F6" },
                    { priority: "Low Task", value: taskPriorities.lowTask, color: "#F472B6" },
                  ].map((bar) => {
                    const h = Math.max(2, scale(bar.value))
                    return (
                      <div key={bar.priority} className="relative group flex flex-col items-center" style={{ width: 64 }}>
                        {/* Value label */}
                        <div className="text-white text-sm font-medium mb-1">{bar.value}</div>
                        <div
                          className="w-full transition-all duration-300 rounded-t-lg"
                          style={{ height: h, backgroundColor: bar.color, position: "relative" }}
                        >
                          {/* Bar gloss */}
                          <div className="absolute inset-0">
                            <div className="w-full h-full bg-gradient-to-t from-white/10 to-transparent rounded-t-lg" />
                          </div>
                          {/* Hover tooltip */}
                          <div
                            className="absolute opacity-0 group-hover:opacity-100 left-full top-1/2 -translate-y-1/2 ml-2 bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg transition-opacity z-10"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {bar.priority}
                            <br />
                            <span className="font-semibold">{bar.value} tasks</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* X-axis labels row aligned with bars */}
                <div className="col-start-2 row-start-2 mt-2">
                  <div className="flex justify-around text-[13px] font-medium">
                    <div className="text-center" style={{ color: "#34D399", width: 64 }}>
                      High Task
                    </div>
                    <div className="text-center" style={{ color: "#0CA9F6", width: 64 }}>
                      Medium Task
                    </div>
                    <div className="text-center" style={{ color: "#F472B6", width: 64 }}>
                      Low Task
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
        <div
          className="rounded-2xl border border-white/10 p-6 text-white/90 backdrop-blur-xl min-h-[320px] flex flex-col justify-center"
          style={{ background: "#0000004D" }}
        >
          <div className="text-lg font-semibold mb-2">Members Task Breakdown</div>
          <div className="text-white/70 text-base font-semibold mb-4">Member</div>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {memberTaskCounts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/70">No members with tasks found</p>
              </div>
            ) : (
              memberTaskCounts.map((member) => {
                const taskPercentage = (
                  (parseInt(member.taskCount) / taskCounts.totalTask) *
                  100
                ).toFixed(0)
                return (
                  <div
                    key={member.userId}
                    className="bg-[#0000004D] rounded-xl px-4 py-2 flex flex-col gap-1 shadow border border-white/20"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-xs font-medium">{member.userName}</span>
                      <span className="text-white/70 text-xs">{member.taskCount} tasks</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${taskPercentage}%`,
                          background: "linear-gradient(90deg, #3B82F6 60%, #60A5FA 100%)",
                          transition: "width 0.4s",
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryTab
