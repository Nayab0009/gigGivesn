"use client"

import { useParams } from "next/navigation"
import TaskDetailsPanel from "@/components/managerDashboard/TaskDetailScreen"

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <TaskDetailsPanel taskId={id} />
      </div>
    </div>
  )
}