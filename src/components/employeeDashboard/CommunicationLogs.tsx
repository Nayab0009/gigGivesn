"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShowEmployee } from "@/lib/TeamService"
import { sendMessage as fetchChatHistoryAPI } from "@/lib/chatService"
import { RefreshCw } from "lucide-react"
import { colors } from "@/colors"

interface CommLog {
  id: number | string
  name: string
  avatar?: string
  lastMessage: string
}

interface CommunicationLogsProps {
  userId?: string
  userRole?: string
}

export default function CommunicationLogs({ userId, userRole }: CommunicationLogsProps) {
  const [commLogs, setCommLogs] = useState<CommLog[]>([])
  const [commLoading, setCommLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCommLogs = async () => {
      if (!userId || !userRole) return

      setCommLoading(true)
      try {
        // Get opposite role for chat contacts
        const contactRole = userRole === "manager" ? "employee" : "manager"
        const response = await ShowEmployee(contactRole)
        const contacts = (response?.data || []).slice(0, 2)

        // For each contact, fetch last message
        const logs = await Promise.all(
          contacts.map(async (contact: any) => {
            let lastMsg = null
            try {
              const data = await fetchChatHistoryAPI(userId, contact.id.toString())
              const arr = Array.isArray(data) ? data : data.messages || []
              if (arr.length > 0) {
                const msg = arr[arr.length - 1]
                lastMsg =
                  typeof msg.messageBody === "string" && msg.messageBody.startsWith("http")
                    ? "File"
                    : msg.messageBody || "Voice Message"
              }
            } catch {}
            return {
              id: contact.id,
              name: contact.name,
              avatar: contact.avatar || undefined,
              lastMessage: lastMsg || "Voice Message",
            }
          })
        )
        setCommLogs(logs)
      } catch (e) {
        setCommLogs([])
      } finally {
        setCommLoading(false)
      }
    }
    fetchCommLogs()
  }, [userId, userRole])

  return (
    <div
      className="rounded-3xl p-5 flex flex-col border border-blue-200/30 bg-black/30 shadow-md w-full min-w-[280px] max-w-[340px] mx-auto h-auto"
      style={{
        minHeight: "200px",
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
        transition: "box-shadow 0.2s",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-white">Communication Logs</span>
        <button
          className="text-xs font-medium text-blue-300 hover:underline focus:outline-none"
          onClick={() => router.push("/dashboard/manager/chat")}
        >
          See All
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {commLoading ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mb-2" style={{ color: colors.primary.hex }} />
            <span className="text-blue-200">Loading communications...</span>
          </div>
        ) : commLogs.length === 0 ? (
          <div className="text-center text-blue-200 py-8">No communication logs found.</div>
        ) : (
          commLogs.map((log, idx) => (
            <div
              key={log.id || idx}
              className="flex items-center justify-between bg-black/20 rounded-2xl px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-900 text-white font-bold text-lg">
                  {log.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{log.name}</span>
                  <span
                    className="text-xs text-blue-300 truncate max-w-[120px]"
                    title={log.lastMessage}
                  >
                    {log.lastMessage && log.lastMessage.length > 10
                      ? log.lastMessage.slice(0, 10) + "..."
                      : log.lastMessage}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white">📞</button>
                <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white">🎥</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
