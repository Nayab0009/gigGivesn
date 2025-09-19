"use client"
import { useEffect, useState } from "react"
import { MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { getManagerTasksToday } from "@/lib/TaskService"

const TodayTask = () => {
  const [tasks, setTasks] = useState({
    high: [] as any[],
    medium: [] as any[],
    low: [] as any[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getManagerTasksToday()
        if (res && Array.isArray(res)) {
          const grouped = { high: [] as any[], medium: [] as any[], low: [] as any[] }
          res.forEach((task: any) => {
            const priority = task.priority?.toLowerCase()
            if (priority === "high") grouped.high.push(task)
            else if (priority === "medium") grouped.medium.push(task)
            else if (priority === "low") grouped.low.push(task)
          })
          setTasks(grouped)
        }
      } catch (err) {
        console.error("Error fetching tasks:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const renderColumn = (title: string, taskList: any[]) => (
    <div className="flex-1 bg-black/90 rounded-2xl p-4 flex flex-col">
      {/* Only show column header if data is loaded */}
      {!loading && (
        <div>
          <div className="flex items-center mb-4 justify-center">
            <span className="w-3 h-3 bg-white rounded-full mr-2"></span>
            <h3 className="text-white font-semibold">{title} Priority</h3>
          </div>
            <div className="mt-2 border-t border-white" />
        </div>
      )}

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-sky-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3 mt-5">
          {taskList.map((task, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#181c24] border border-white/10 shadow-md flex flex-col space-y-2"
            >
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-sky-400">{task.ticketNumber}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {task.priority}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-white font-medium">{task.title}</h4>
                <p className="text-gray-400 text-sm">{task.description}</p>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                {task.taskFor?.avatar ? (
                    <Image
                    src={task.taskFor.avatar}
                    alt={task.taskFor?.name || "User"}
                    width={28}
                    height={28}
                    className="rounded-full w-7 h-7 object-cover border border-black"
                    />
                ) : (
                    <div
                    className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs border border-black"
                    title={task.taskFor?.name || "User"}
                    >
                    {task.taskFor?.name?.charAt(0) || "U"}
                    </div>
                )}
                <span className="text-gray-400 text-sm">
                    {task.taskDate ? new Date(task.taskDate).toLocaleDateString() : "—"}
                </span>
                </div>

                <MoreHorizontal className="text-gray-400 w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-6 flex-grow">
        {renderColumn("High", tasks.high)}
        {renderColumn("Low", tasks.low)}
        {renderColumn("Medium", tasks.medium)}
      </div>
    </div>
  )
}

export default TodayTask
