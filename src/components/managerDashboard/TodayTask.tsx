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
    <div
      className="flex flex-col"
      style={{
        width: '385.33px',
        height: '661px',
        borderRadius: '22px',
        border: '1px solid #FFFFFF4D',
        padding: '12px',
        gap: '10px',
        opacity: 1,
        background: '#0000004D',
        boxSizing: 'border-box',
      }}
    >
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
              style={{
                width: '361.33px',
                height: '197.93px',
                borderRadius: '15px',
                border: '1px solid #FFFFFF4D',
                padding: '16.27px',
                gap: '12px',
                opacity: 1,
                background: '#0000004D',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between mb-2">
                {/* Ticket Number Badge */}
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontStyle: 'normal',
                    fontSize: '10px',
                    lineHeight: '100%',
                    letterSpacing: '0px',
                    verticalAlign: 'middle',
                    color: '#0CA9F6',
                    background: 'rgba(12, 169, 246, 0.10)',
                    borderRadius: '4px',
                    paddingRight: '4px',
                    paddingLeft: '4px',
                    height: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 1,
                  }}
                >
                  {task.ticketNumber}
                </span>
                {/* Priority Badge ("Done" badge styling if task.status === 'done') */}
                {task.status === 'done' ? (
                  <span
                    style={{
                      width: '26px',
                      height: '10px',
                      borderRadius: '4px',
                      background: '#BD4242',
                      color: '#fff',
                      fontSize: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      gap: '4px',
                      paddingRight: '4px',
                      paddingLeft: '4px',
                      opacity: 1,
                    }}
                  >
                    Done
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '10px',
                      borderRadius: '4px',
                      background: '#BD4242',
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      paddingRight: '4px',
                      paddingLeft: '4px',
                      height: '18px',
                      opacity: 1,
                    }}
                  >
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h4
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '28.47px',
                    letterSpacing: '0px',
                    verticalAlign: 'middle',
                    color: '#fff',
                  }}
                >
                  {task.title}
                </h4>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '100%',
                    letterSpacing: '0px',
                    verticalAlign: 'middle',
                    color: '#fff',
                  }}
                >
                  {task.description}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between mt-2">
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
      <div
        className="flex flex-row items-center justify-center mx-auto"
        style={{
          width: '1180px',
          height: '661px',
          gap: '12px',
          opacity: 1,
        }}
      >
        {renderColumn("High", tasks.high)}
        {renderColumn("Low", tasks.low)}
        {renderColumn("Medium", tasks.medium)}
      </div>
    </div>
  )
}

export default TodayTask
