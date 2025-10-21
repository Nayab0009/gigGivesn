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
    <div className="space-y-6 px-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border:var(--border-style)]
    mb-2 [box-shadow:var(--shadow-combined)] [background:var(--container-bg)]  p-4 text-text-main backdrop-blur-xl flex flex-col gap-2"
          
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md">{c.icon}</span>
              <span className="text-2xl font-semibold mx-1">{c.value}</span>
              <span className="text-sm capitalize font-medium ">{c.label}</span>
            </div>
            <div className="text-xs  mt-1">
              {c.label === "due soon" ? "in the next 7 days" : "in the last 7 days"}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-2xl [border:var(--border-style)]
    [box-shadow:var(--shadow-combined)] [background:var(--container-bg)] p-6 text-white/90 backdrop-blur-xl min-h-[320px] max-h-[380px] overflow-auto"
          
        >
          <div className="text-lg font-semibold mb-2 text-text-main">Status overview</div>
          <div className="text-text-main text-sm mb-6">
            {taskCounts.totalTask > 0 ? (
              "Current status overview of all work items in this project"
            ) : (
              <>
                The status overview for this project will display here after you{" "}
                <span style={{ color: "#0CA9F6" }}>create some work items</span>
              </>
            )}
          </div>
          <div className="text-center text-text-main  mt-18 text-6xl font-light font-roboto">{taskCounts.totalTask}</div>
          <div className="text-center text-text-main text-sm">Total work items</div>
        </div>
        <div
          className="rounded-2xl  [border:var(--border-style)]
    [box-shadow:var(--shadow-combined)] [background:var(--container-bg)] p-6 text-white/90 backdrop-blur-xl min-h-[320px] max-h-[380px] overflow-auto"
        
        >
          <div className="text-lg font-semibold mb-2 text-text-main">Description</div>
          {project?.description ? (
            <div className="mt-4 text-text-main">{project.description}</div>
          ) : (
            <div className="flex flex-col mt-12 items-center justify-center h-[150px]">
              <div className="font-medium text-white/60">No description available</div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-2xl  [border:var(--border-style)]
    [box-shadow:var(--shadow-combined)]  [background:var(--container-bg)] p-6 text-white/90 backdrop-blur-xl min-h-[320px] "
         
        >
          <div className="text-lg font-semibold mb-2 text-text-main ">Priority breakdown</div>
          <div className="text-text-main text-sm mb-6 text-text-main">
            Get a holistic view of how work is being prioritized.{" "}
            <a
              href="#"
              className="text-[#0CA9F6] hover:underline"
              style={{ color: "#0CA9F6" }}
            >
              How to manage priorities for projects
            </a>
          </div>
          <div className="w-full flex justify-center items-center" style={{ minHeight: 300 }}>
            {/* Unified grid-based chart for clean axis/bar alignment */}
            <div className="relative w-full max-w-xl" style={{ height: 260 }}>
              {(() => {
                // Compute nice tick values and scaling
                const rawMax = Math.max(
                  taskPriorities.highTask,
                  taskPriorities.mediumTask,
                  taskPriorities.lowTask,
                  0
                )
                const paddedMax = Math.max(1, Math.ceil(rawMax * 1.1))
                const tickCount = 4 // plus 0 at bottom => 5 labels
                const step = Math.max(1, Math.ceil(paddedMax / tickCount))
                const topTick = step * tickCount
                const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => i * step)

                const chartHeight = 180 // px

                const scale = (v: number) => (v / topTick) * chartHeight

                return (
                  <div className="grid grid-cols-[64px_1fr] grid-rows-[180px_auto] gap-x-0 px-4 py-4">
                    {/* Y-axis column */}
                    <div className="relative col-start-1 row-start-1" style={{ height: chartHeight }}>
                      {/* Vertical axis line */}
                      <div
                        className="absolute top-0 bottom-0 right-0"
                        style={{ width: 2, background: "#ffffff", borderRadius: 2 }}
                      />
                      {/* Tick labels */}
                      {yTicks.map((t, i) => {
                        const pos = (t / topTick) * 100 // percentage from bottom
                        return (
                          <div
                            key={`tick-${i}`}
                            className="absolute text-text-main text-xs"
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
                            <div className="text-text-main text-sm font-medium mb-1">{bar.value}</div>
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
          </div>
        </div>
        <div
          className="rounded-2xl  [border:var(--border-style)]
    [box-shadow:var(--shadow-combined)] p-6 text-white/90 backdrop-blur-xl  [background:var(--container-bg)] max-h-[450px] overflow-auto flex flex-col "
        
        >
          <div className="text-lg font-semibold mb-2 text-text-main">Members Task Breakdown</div>
          <div className="text-text-main text-base font-semibold mb-4" >Member</div>
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
                    className=" [background:var(--container-bg)]  rounded-xl px-4 py-2 flex flex-col gap-1 shadow border border-white/20"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-text-main text-xs font-medium">{member.userName}</span>
                      <span className="text-text-main text-xs">{member.taskCount} tasks</span>
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
